from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import * 

class ProfileAdmin(admin.ModelAdmin):
    search_fields  = ['user']
    list_display = ['thumbnail', 'user', 'full_name']

class CategoryAdmin(admin.ModelAdmin):
    list_display = ["title"]

class PostAdmin(admin.ModelAdmin):
    list_display = ["title","user","category","view"]

class CommentAdmin(admin.ModelAdmin):
    list_display = ["post","name","email","comment"]
    

class BookingAdmin(admin.ModelAdmin):  
    list_display = ["event_title", "amount", "created_at"]  
    search_fields = ["event_title"]  
    list_filter = ["created_at"]  

admin.site.register(Booking, BookingAdmin)
admin.site.register(Room)
admin.site.register(Message)
admin.site.register(User)
admin.site.register(Profile, ProfileAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Post, PostAdmin)
admin.site.register(Comment, CommentAdmin)
admin.site.register(Event)