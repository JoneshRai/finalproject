from django.contrib import admin 
from .views import * 
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path, include
from . import views


class AllEventsList(generics.ListAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Event.objects.all().order_by("-event_date")
    
urlpatterns = [
    # Userauths API Endpoints
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterViewset.as_view(), name='auth_register'),
    path('profile/<user_id>/', ProfileView.as_view(), name='user_profile'),
    path('password-reset/<email>/', PasswordEmailVerify.as_view(), name='password_reset'),
    path('password-change/', PasswordChangeView.as_view(), name='password_reset'),

    path('', views.home, name="home"),
    path('rooms/<str:room>/', views.room, name="room-detail"),
    path('checkview', views.checkview, name="checkview"),
    path('send', views.send, name="send"),
    path('getMessages/<str:room>/', views.getMessages, name="getMessages"),
 

    path('create-booking/', CreateBookingView.as_view(), name='create-booking'),
    
    path('users/list/', list_users, name='list_users'),
    path('messages', MessageAPIView.as_view()),
   

    # Event Endpoints
    path('events/', DashboardEventCreate.as_view(), name='create-event'),
    path('eventlist/<int:user_id>/',DashboardEventList.as_view(),name='eventList'),
    path('eventlist/', AllEventsList.as_view(), name='all_events_list'),



    # Post Endpoints
    path('post/category/list/', CategoryListAPIView.as_view()),
    path('Post/category/posts/<category_slug>/', PostCategoryListAPIView.as_view()),
    path('postlist/',PostListAPIView.as_view(),name='postList'),
    path('postdetail/<slug>/',PostDetailAPIView.as_view(),name='postdetail'),
    path('likepost/',LikePostAPIView.as_view(),name='like'),
    path('viewcomment/',ViewComment.as_view(),name='comment'),


    # Dashboard APIS
    path('Dashboard/<user_id>/',Dashboard.as_view(),name='Dashboard'),
    path('post-list/<user_id>/',DashboardPostlist.as_view(),name='DashboardPostlist'),
    path('CommentList/<user_id>/',DashboardCommentList.as_view(),name='DashboardCommentList'),
    path('CommentReply/',DashboardCommentReply.as_view(),name='DashboardCommentReply'),
    path('DashboardPostCreate/',DashboardPostCreate.as_view(),name='DashboardPostCreate'),
    path('DashboardUpdatePost/',DashboardUpdatePost.as_view(),name='DashboardUpdatePost'),

    path('Ai/', views.recommend, name='recommend')


]