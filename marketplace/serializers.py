from rest_framework import serializers
from .models import Notification, Bird

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'is_read', 'created_at', 'action_url']

class BirdSerializer(serializers.ModelSerializer):
    seller_name = serializers.CharField(source='seller.username', read_only=True)
    seller_rating = serializers.FloatField(source='seller.rating', read_only=True)
    
    class Meta:
        model = Bird
        fields = [
            'id', 'breed', 'species', 'age', 'gender', 'price', 
            'health_status', 'location', 'image_url', 'quantity_available',
            'seller_name', 'seller_rating', 'is_verified', 'is_featured',
            'created_at'
        ]