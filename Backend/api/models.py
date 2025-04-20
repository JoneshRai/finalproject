from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.html import mark_safe
from django.utils.text import slugify
from django.utils import timezone
from datetime import datetime
from django_rest_passwordreset.signals import reset_password_token_created
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from shortuuid.django_fields import ShortUUIDField
import shortuuid
from django.conf import settings


from django.contrib.auth.models import User


class User(AbstractUser):
    username = models.CharField(unique=True, max_length=100)
    email = models.EmailField(unique=True) 
    full_name = models.CharField(max_length=100, null=True, blank=True)
    otp = models.CharField(max_length=100, null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
    
    def save(self, *args, **kwargs):
        email_username, mobile = self.email.split("@")
        if self.full_name == "" or self.full_name == None:
            self.full_name = email_username
        if self.username == "" or self.username == None:
            self.username = email_username  
    
        super(User, self).save(*args, **kwargs)

# @receiver(reset_password_token_created)
# def password_reset_token_created(reset_password_token,args,*kwargs):
#     sitelink="http://localhost:5173/"
#     token="{}".format(reset_password_token.key)
#     full_link = str(sitelink)+str("passwordreset/")+str(token)
    
#     print(token)
#     print(full_link)

#     context={
#         'full_link': full_link,
#         'email_address': reset_password_token.user.email
        
#     }
    
#     html_message = render_to_string("back/email.html", context=context)
#     plain_message = strip_tags(html_message)
    
#     msg= EmailMultiAlternatives(
#         subject="Request for resetting password for {title}".format(title=reset_password_token.user.email),
#         body = plain_message,
#         from_email =settings.DEFAULT_FROM_EMAIL,
#         to=[reset_password_token.user.email]
#     )

#     msg.attach_alternative(html_message, "text/html")
#     msg.send()

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.FileField(upload_to="image", default="default/default-user.jpg", null=True, blank=True)
    full_name = models.CharField(max_length=100, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    about = models.TextField(null=True, blank=True)
    author = models.BooleanField(default=False)
    country = models.CharField(max_length=100, null=True, blank=True)
    facebook = models.CharField(max_length=100, null=True, blank=True)
    twitter = models.CharField(max_length=100, null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.full_name:
            return str(self.full_name)
        else:
            return str(self.user.full_name)
    

    def save(self, *args, **kwargs):
        if self.full_name == "" or self.full_name == None:
            self.full_name = self.user.full_name
        super(Profile, self).save(*args, **kwargs)

    def thumbnail(self):
        return mark_safe('<img src="/media/%s" width="50" height="50" object-fit:"cover" style="border-radius: 30px; object-fit: cover;" />' % (self.image))
    

def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

post_save.connect(create_user_profile, sender=User)
post_save.connect(save_user_profile, sender=User)

class Category(models.Model):
    title = models.CharField(max_length=100)
    image = models.FileField(upload_to="image", null=True, blank=True)
    slug = models.SlugField(unique=True, null=True, blank=True)

    def __str__(self):
        return self.title
    
    class Meta:
        verbose_name_plural = "Category"

    def save(self, *args, **kwargs):
        if self.slug == "" or self.slug == None:
            self.slug = slugify(self.title)
        super(Category, self).save(*args, **kwargs)
    
    def post_count(self):
        return Post.objects.filter(category=self).count()

class Post(models.Model): 
    STATUS = ( 
        ("Active", "Active"), 
        ("Draft", "Draft"),
        ("Disabled", "Disabled"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=100, default="Untitled Event")
    image = models.FileField(upload_to="image", null=True, blank=True)
    video = models.FileField(upload_to="videos", null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    tags = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='posts')
    status = models.CharField(max_length=100, choices=STATUS, default="Active")
    view = models.IntegerField(default=0)
    likes = models.ManyToManyField(User, blank=True, related_name="likes_user")
    # video = models.FileField(upload_to="videos", null=True, blank=True)  # <-- New field for videos
    tagged_users = models.ManyToManyField(User, blank=True, related_name="tagged_posts")  # New field for tagged users
    slug = models.SlugField(unique=True, null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        verbose_name_plural = "Post"

    def save(self, *args, **kwargs):
        if not self.profile and self.user:  
            self.profile = self.user.profile  # Assign profile if missing
        if not self.slug:
            self.slug = slugify(self.title) + "-" + shortuuid.uuid()[:2]
        super(Post, self).save(*args, **kwargs)

    def comments(self):
        return Comment.objects.filter(post=self).order_by("-id")


    
class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    email = models.CharField(max_length=100)
    comment = models.TextField()
    reply = models.TextField(null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.post.title} - {self.name}"
    
    class Meta:
        verbose_name_plural = "Comment"




class Event(models.Model):
    STATUS = ( 
        ("Upcoming", "Upcoming"), 
        ("Ongoing", "Ongoing"),
        ("Completed", "Completed"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)  # Event name
    description = models.TextField(null=True, blank=True)
    event_date = models.DateTimeField(default=timezone.now)
    location = models.CharField(max_length=200, null=True, blank=True)  # Event location
    start_time = models.TimeField()  # Event start time
    end_time = models.TimeField()  # Event end time
    status = models.CharField(max_length=100, choices=STATUS, default="Upcoming")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='events')
    slug = models.SlugField(unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        verbose_name_plural = "Event"

    def save(self, *args, **kwargs):
        if self.slug == "" or self.slug is None:
            self.slug = slugify(self.title) + "-" + shortuuid.uuid()[:2]
        super(Event, self).save(*args, **kwargs)
    

class Room(models.Model):
    name = models.CharField(max_length=1000)

class Message(models.Model):
    value = models.CharField(max_length=10000000)
    date = models.DateTimeField(default=datetime.now, blank=True)
    room = models.CharField(max_length=1000000)
    user = models.CharField(max_length=1000000)



class Booking(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    event_title = models.CharField(max_length=255)  # Store the event title
    amount = models.DecimalField(max_digits=10, decimal_places=2)  # Ensure amount is defined
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.event_title} - Rs.{self.amount}"