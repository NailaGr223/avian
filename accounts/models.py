from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    USER_TYPES = [
        ('buyer', 'Buyer'),
        ('seller', 'Seller'),
        ('vet', 'Veterinarian'),
        ('admin', 'Administrator'),
    ]
    
    user_type = models.CharField(max_length=10, choices=USER_TYPES, default='buyer')
    phone = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    rating = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.username
    
    class Meta:
        ordering = ['-created_at']