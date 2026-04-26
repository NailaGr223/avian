from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Bird(models.Model):
    LISTING_TYPES = [
        ('sell', 'For Sale'),
        ('rehome', 'Rehoming'),
        ('adopt', 'Adoption'),
    ]
    
    HEALTH_STATUS = [
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('fair', 'Fair'),
    ]
    
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='birds')
    breed = models.CharField(max_length=100)
    species = models.CharField(max_length=100)
    age = models.CharField(max_length=50)
    gender = models.CharField(max_length=20)
    health_status = models.CharField(max_length=20, choices=HEALTH_STATUS)
    location = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    quantity_available = models.IntegerField(default=1)
    quantity_sold = models.IntegerField(default=0)
    description = models.TextField()
    image_url = models.ImageField(upload_to='birds/')
    health_certificate = models.FileField(upload_to='certificates/', null=True, blank=True)
    listing_type = models.CharField(max_length=20, choices=LISTING_TYPES, default='sell')
    is_featured = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    views = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.breed} - {self.species}"
    
    class Meta:
        ordering = ['-created_at']


class BirdImage(models.Model):
    bird = models.ForeignKey(Bird, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='birds/')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Image for {self.bird.breed}"


class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    birds = models.ManyToManyField(Bird, through='CartItem')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Cart for {self.user.username}"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE)
    bird = models.ForeignKey(Bird, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.bird.breed} in {self.cart.user.username}'s cart"


class Wishlist(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wishlist')
    birds = models.ManyToManyField(Bird)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Wishlist for {self.user.username}"


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    action_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-created_at']


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    bird = models.ForeignKey(Bird, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    shipping_address = models.TextField()
    tracking_number = models.CharField(max_length=100, blank=True)
    delivery_method = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Order {self.id} by {self.buyer.username}"
    
    class Meta:
        ordering = ['-created_at']


class Review(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='review')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Review by {self.reviewer.username}"


class AbuseReport(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('investigating', 'Investigating'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    ]
    
    reporter = models.ForeignKey(User, on_delete=models.CASCADE)
    report_type = models.CharField(max_length=50)
    item_id = models.IntegerField(null=True, blank=True)
    reason = models.CharField(max_length=200)
    severity = models.CharField(max_length=20)
    description = models.TextField()
    evidence = models.FileField(upload_to='reports/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Report {self.id} - {self.reason}"


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    text = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Message from {self.sender.username} to {self.recipient.username}"
    
    class Meta:
        ordering = ['-created_at']