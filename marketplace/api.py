from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Bird, Cart, CartItem, Notification, Wishlist
from .serializers import NotificationSerializer, BirdSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request, bird_id):
    bird = get_object_or_404(Bird, id=bird_id)
    cart, created = Cart.objects.get_or_create(user=request.user)
    
    cart_item, created = CartItem.objects.get_or_create(cart=cart, bird=bird)
    if not created:
        cart_item.quantity += 1
        cart_item.save()
    
    return Response({
        'success': True,
        'message': 'Bird added to cart',
        'cart_count': cart.cartitem_set.count()
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, item_id):
    cart = get_object_or_404(Cart, user=request.user)
    bird = get_object_or_404(Bird, id=item_id)
    
    CartItem.objects.filter(cart=cart, bird=bird).delete()
    
    return Response({
        'success': True,
        'message': 'Bird removed from cart',
        'cart_count': cart.cartitem_set.count()
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_cart_quantity(request, item_id):
    quantity = request.data.get('quantity', 1)
    cart = get_object_or_404(Cart, user=request.user)
    bird = get_object_or_404(Bird, id=item_id)
    
    cart_item = get_object_or_404(CartItem, cart=cart, bird=bird)
    cart_item.quantity = int(quantity)
    cart_item.save()
    
    return Response({'success': True})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clear_cart(request):
    cart = get_object_or_404(Cart, user=request.user)
    CartItem.objects.filter(cart=cart).delete()
    
    return Response({'success': True})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
    
    return Response({
        'notifications': NotificationSerializer(notifications, many=True).data,
        'unreadCount': notifications.filter(is_read=False).count(),
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_as_read(request):
    Notification.objects.filter(user=request.user).update(is_read=True)
    
    return Response({'success': True})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_as_read(request, notification_id):
    notification = get_object_or_404(Notification, id=notification_id, user=request.user)
    notification.is_read = True
    notification.save()
    
    return Response({'success': True})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_notification(request, notification_id):
    notification = get_object_or_404(Notification, id=notification_id, user=request.user)
    notification.delete()
    
    return Response({'success': True})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_wishlist(request, bird_id):
    bird = get_object_or_404(Bird, id=bird_id)
    wishlist, created = Wishlist.objects.get_or_create(user=request.user)
    
    if bird in wishlist.birds.all():
        wishlist.birds.remove(bird)
        in_wishlist = False
    else:
        wishlist.birds.add(bird)
        in_wishlist = True
    
    return Response({
        'success': True,
        'in_wishlist': in_wishlist
    })

@api_view(['GET'])
def search_birds(request):
    query = request.GET.get('q', '')
    birds = Bird.objects.filter(listing_type='sell')
    
    if query:
        birds = birds.filter(
            Q(breed__icontains=query) |
            Q(species__icontains=query) |
            Q(location__icontains=query)
        )
    
    return Response({
        'results': BirdSerializer(birds, many=True).data,
        'total': birds.count()
    })