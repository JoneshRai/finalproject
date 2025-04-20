from rest_framework import viewsets, permissions

from django.http import JsonResponse
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.db.models import Sum
# Restframework
from rest_framework import status
from rest_framework.decorators import api_view, APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
import os
import joblib
import re
import numpy as np
import pandas as pd
from django.shortcuts import render, redirect
from django.http import Http404

from drf_yasg.utils import swagger_auto_schema
from datetime import datetime

# Others
import json
import random
import stripe
# Custom Imports
from .serializer import *
from .models import *
from .pusher import pusher_client
from rest_framework.response import Response
from rest_framework.views import APIView

# recommendation system
MODEL= os.path.join(os.path.dirname(__file__), 'model', 'model.pkl')
VECTORIZER = os.path.join(os.path.dirname(__file__), 'model', 'vectorizer.pkl')

model = joblib.load(MODEL)
vectorizer = joblib.load(VECTORIZER)

DATASET_PATH = os.path.join(os.path.dirname(__file__), 'fypdataset.csv')
df = pd.read_csv(DATASET_PATH)

# Function to clean the input text
def clean_data(text):
    # Implement text cleaning logic (lowercase, remove special characters, etc.)
    text = re.sub(r'[^a-zA-Z0-9 ]', '', text.lower())
    return text

@api_view(['POST'])
def recommend(request):
    # Accept both topic and description
    topic = request.data.get("topic", "")
    description = request.data.get("description", "")
    user_input = f"{topic} {description}".strip()

    if not user_input:
        return Response({"error": "Both topic and description are empty."}, status=status.HTTP_400_BAD_REQUEST)

    # Clean and vectorize
    cleaned_text = clean_data(user_input)
    transformed_text = vectorizer.transform([cleaned_text])

    # Predict subject
    probabilities = model.predict_proba(transformed_text)[0]
    recommended_subject = model.classes_[probabilities.argmax()]
    confidence = probabilities.max()

    # Get videos related to subject
    related_videos = df[df['Topic'].str.contains(recommended_subject, case=False, na=False)]

    # Limit to top 20 videos and return both title and URL
    video = []
    for _, row in related_videos.head(20).iterrows():
        video.append({
            "title": row.get("Title", "No Title"),
            "url": row.get("URL", "")
        })

    return Response({
        "recommended_subject": recommended_subject,
        "confidence": round(float(confidence), 2),
        "videos": video,
        "message": "Results regardless of confidence."
    }, status=status.HTTP_200_OK)


# message

class MessageAPIView(APIView):

    def post(self, request):
        pusher_client.trigger('api', 'message', {
            'username': request.data['username'],
            'message': request.data['message'],
        })

        return Response([])


# This code defines a DRF View class called MyTokenObtainPairView, which inherits from TokenObtainPairView.
class MyTokenObtainPairView(TokenObtainPairView):
    # Here, it specifies the serializer class to be used with this view.
    serializer_class = MyTokenObtainPairSerializer

# This code defines another DRF View class called RegisterView, which inherits from generics.CreateAPIView.
class RegisterViewset(generics.CreateAPIView):
    # It sets the queryset for this view to retrieve all User objects.
    queryset = User.objects.all()
    # It specifies that the view allows any user (no authentication required).
    permission_classes = (AllowAny,)
    # It sets the serializer class to be used with this view.
    serializer_class = RegisterSerializer



class LoginViewset(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']

            user = authenticate(request, email=email, password=password)

            if user:
                refresh = RefreshToken.for_user(user)
                return Response(
                    {
                        "user": self.serializer_class(user).data,
                        "access": str(refresh.access_token),
                        "refresh": str(refresh)
                    }
                )
            else:
                return Response({"error": "Invalid Credentials"}, status=401)
        return Response(serializer.errors, status=400)
        

# This code defines another DRF View class called ProfileView, which inherits from generics.RetrieveAPIView and used to show user profile view.
class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProfileSerializer

    def get_object(self):
        user_id = self.kwargs['user_id']

        user = User.objects.get(id=user_id)
        profile = Profile.objects.get(user=user)
        return profile

def generate_numeric_otp(length=7):
        # Generate a random 7-digit OTP
        otp = ''.join([str(random.randint(0, 9)) for _ in range(length)])
        return otp

class PasswordEmailVerify(generics.RetrieveAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer
    
    def get_object(self):
        email = self.kwargs['email']
        user = User.objects.get(email=email)
        
        if user:
            user.otp = generate_numeric_otp()
            uidb64 = user.pk
            
             # Generate a token and include it in the reset link sent via email
            refresh = RefreshToken.for_user(user)
            reset_token = str(refresh.access_token)

            # Store the reset_token in the user model for later verification
            user.reset_token = reset_token
            user.save()

            link = f"http://localhost:5173/create-new-password?otp={user.otp}&uidb64={uidb64}&reset_token={reset_token}"
            
            merge_data = {
                'link': link, 
                'username': user.username, 
            }
            subject = f"Password Reset Request"
            text_body = render_to_string("email/password_reset.txt", merge_data)
            html_body = render_to_string("email/password_reset.html", merge_data)
            
            msg = EmailMultiAlternatives(
                subject=subject, from_email=settings.FROM_EMAIL,
                to=[user.email], body=text_body
            )
            msg.attach_alternative(html_body, "text/html")
            msg.send()
        return user
    

class PasswordChangeView(generics.CreateAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer
    
    def create(self, request, *args, **kwargs):
        payload = request.data
        
        otp = payload['otp']
        uidb64 = payload['uidb64']
        password = payload['password']

        

        user = User.objects.get(id=uidb64, otp=otp)
        if user:
            user.set_password(password)
            user.otp = ""
            user.save()
            
            return Response( {"message": "Password Changed Successfully"}, status=status.HTTP_201_CREATED)
        else:
            return Response( {"message": "An Error Occured"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

######################## Post APIs ########################
        

class CategoryListAPIView(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Category.objects.all()

class PostCategoryListAPIView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        category_slug = self.kwargs['category_slug'] 
        category = Category.objects.get(slug=category_slug)
        return Post.objects.filter(category=category, status="Active")

class PostListAPIView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Post.objects.all()
    
class PostDetailAPIView(generics.RetrieveAPIView):
    serializer_class = PostSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        slug = self.kwargs['slug']
        post = Post.objects.get(slug=slug, status="Active")
        post.view += 1
        post.save()
        return post
        
class LikePostAPIView(APIView):
    def post(self,request):
        user_id = request.data.get('user_id') 
        post_id = request.data.get('post_id') 

        user = User.objects.get(id=user_id)
        feed = Post.objects.get(id=post_id)
        
        if user in feed.likes.all():
            feed.likes.remove(user)
            return Response({"message":"Post Disliked"},status=status.HTTP_200_OK)
        else:
            feed.likes.add(user)
            
            return Response({"message":"Post Liked"},status=status.HTTP_201_CREATED)
        
class ViewComment(APIView):
    def post(self, request):
        # Get data from request.data (frontend)
        post_id = request.data.get('post_id')
        name = request.data.get('name')
        email = request.data.get('email')
        comment = request.data.get('comment')

        # Validate required fields
        if not (post_id and name and email and comment):
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the post exists
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

        # Create Comment
        Comment.objects.create(
            post=post,
            name=name,
            email=email,
            comment=comment
        )

        return Response({"message": "Comment Sent"}, status=status.HTTP_201_CREATED)
 


######################## Author Dashboard APIs ########################
class Dashboard(generics.ListAPIView):
    serializer_class = AuthorSerial
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = User.objects.get(id=user_id)

        views = Post.objects.filter(user=user).aggregate(view=Sum("view"))['view']
        posts = Post.objects.filter(user=user).count()
        likes = Post.objects.filter(user=user).aggregate(total_likes=Sum("likes"))['total_likes']
       

        return [{
            "views": views,
            "posts": posts,
            "likes": likes,
           
        }]
    
    def list(self, request, *args, **kwargs):
        querset = self.get_queryset()
        serializer = self.get_serializer(querset, many=True)
        return Response(serializer.data)

class DashboardPostlist(generics.ListAPIView):
        serializer_class= PostSerializer
        permission_classes=[permissions.AllowAny]
        
        def get_queryset(self):
           user_id=self.kwargs['user_id']
           user = User.objects.get(id=user_id)
           return Post.objects.filter(user=user).order_by("-id")

class DashboardCommentList(generics.ListAPIView):
        serializer_class=CommentSerializer
        permission_classes=[permissions.AllowAny]
        
        def get_queryset(self):
            user_id=self.kwargs['user_id']
            user=User.objects.get(id=user_id)
           
            return Comment.objects.filter(post__user=user)




class DashboardCommentReply(APIView):
        
        def post(self,request):
            comment_id = request.data['comment_id']
            reply = request.data['reply']
            
            comment=Comment.objects.get(id=comment_id)
            comment.reply=reply
            
            comment.save()
            
            return Response({"message":"Comment response sent"},status=status.HTTP_201_CREATED)
    
class DashboardPostCreate(generics.CreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        print(request.data)
        user_id = request.data.get('user_id')
        title = request.data.get('title')
        image = request.data.get('image')
        video = request.data.get('video')
        description = request.data.get('description')
        tags = request.data.get('tags')
        category_id = request.data.get('category')
        post_status = request.data.get('post_status', 'Active')
        tagged_users_ids = request.data.get('tagged_users', [])

        try:
            user = User.objects.get(id=user_id)
            profile = user.profile  # Access the profile associated with the user
            category = Category.objects.get(id=category_id)
        except User.DoesNotExist:
            return Response({"message": "User not found"}, status=status.HTTP_400_BAD_REQUEST)
        except Category.DoesNotExist:
            return Response({"message": "Category not found"}, status=status.HTTP_400_BAD_REQUEST)

        post = Post.objects.create(
            user=user,
            profile=profile,  # Assign the profile to the post
            title=title,
            image=image,
            video=video,
            description=description,
            tags=tags,
            category=category,
            status=post_status
        )


        post.profile = user.profile
        post.save()

        if tagged_users_ids:
            tagged_users = User.objects.filter(id__in=tagged_users_ids)
            post.tagged_users.set(tagged_users)

        return Response({"message": "Post Created Successfully"}, status=status.HTTP_201_CREATED)




class DashboardUpdatePost(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PostSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']
        post_id = self.kwargs['post_id']
        user = User.objects.get(id=user_id)
        return Post.objects.get(user=user, id=post_id)

    def update(self, request, *args, **kwargs):
        post_instance = self.get_object()

        title = request.data.get('title')
        image = request.data.get('image')
        # video = request.data.get('video')
        description = request.data.get('description')
        tags = request.data.get('tags')
        category_id = request.data.get('category')
        post_status = request.data.get('post_status')

        print(title)
        print(image)
        print(description)
        print(tags)
        print(category_id)
        print(post_status)

        category = Category.objects.get(id=category_id)

        post_instance.title = title
        if image != "undefined":
            post_instance.image = image
        # if video != "undefined":  # Save video file if provided
        #     post_instance.video = video
        post_instance.description = description
        post_instance.tags = tags
        post_instance.category = category
        post_instance.status = post_status
        post_instance.save()

        return Response({"message": "Post Updated Successfully"}, status=status.HTTP_200_OK)

class DashboardEventCreate(generics.CreateAPIView):
    serializer_class = EventSerializer  # Make sure to create a corresponding EventSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        print(request.data)
        user_id = request.data.get('user_id')
        title = request.data.get('title')
        description = request.data.get('description')
        event_date = request.data.get('event_date')
        location = request.data.get('location')
        start_time = request.data.get('start_time')
        end_time = request.data.get('end_time')
        category_id = request.data.get('category')
        event_status = request.data.get('event_status')

        print(user_id)
        print(title)
        print(description)
        print(event_date)
        print(location)
        print(start_time)
        print(end_time)
        print(category_id)
        print(event_status)

        # Retrieve the User and Category models
        user = User.objects.get(id=user_id)
        category = Category.objects.get(id=category_id)

        # Create the Event object
        event = Event.objects.create(
            user=user,
            title=title,
            description=description,
            event_date=event_date,
            location=location,
            start_time=start_time,
            end_time=end_time,
            category=category,
            status=event_status
        )

        return Response({"message": "Event Created Successfully"}, status=status.HTTP_201_CREATED)


class DashboardEventList(generics.ListAPIView):
    serializer_class = EventSerializer  # Update this to your EventSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = User.objects.get(id=user_id)
        # Adjust the model name to Event and filter accordingly
        return Event.objects.filter(user=user).order_by("-event_date")  # You can order by a field like event_date instead of id



@api_view(['GET'])
def list_users(request):
    users = User.objects.all()  # Fetch all users
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)
{
    "title": "New post",
    "image": "",
    "description": "lorem",
    "tags": "tags, here",
    "category_id": 1,
    "post_status": "Active"
} 




def home(request):
    # Fetch all available rooms from the database
    rooms = Room.objects.all()
    username = request.user.username  # Get the logged-in user's username
    return render(request, 'home.html', {'rooms': rooms, 'username': username})

def room(request, room):
    username = request.GET.get('username')
    room_details = Room.objects.get(name=room)
    return render(request, 'room.html', {
        'username': username,
        'room': room,
        'room_details': room_details,
    })

def checkview(request):
    room = request.POST['room_name']
    username = request.POST['username']

    if Room.objects.filter(name=room).exists():
        return redirect(f'/rooms/{room}/?username={username}')
    else:
        new_room = Room.objects.create(name=room)
        new_room.save()
        return redirect(f'/rooms/{room}/?username={username}')


def send(request):
    message = request.POST['message']
    username = request.POST['username']
    room_id = request.POST['room_id']

    new_message = Message.objects.create(value=message, user=username, room=room_id)
    new_message.save()

def getMessages(request, room):
    room_details = Room.objects.get(name=room)
    messages = Message.objects.filter(room=room_details.id)
    return JsonResponse({"messages": list(messages.values())})



class RoomListCreate(generics.ListCreateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class MessageListCreate(generics.ListCreateAPIView):
    serializer_class = MessageSerializer

    def get_queryset(self):
        room_id = self.request.query_params.get('room_id')
        if room_id:
            return Message.objects.filter(room=room_id)
        return Message.objects.all()

class CreateBookingView(APIView):
    def post(self, request, *args, **kwargs):
        # Extract data from the request
        event_title = request.data.get("event_title")
        amount = request.data.get("amount")
        
       
        user_id = self.kwargs['user_id']
        user = User.objects.get(id=user_id)

        # Create the booking with the user
        booking = Booking.objects.create(
            event_title=event_title,
            amount=amount,
            user=user  # Assign the logged-in user
        )

        # Serialize the booking object
        serializer = BookingSerializer(booking)
        
        # Return the created booking data
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    

