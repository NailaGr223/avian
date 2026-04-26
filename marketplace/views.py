from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from .models import Bird, Cart, Wishlist, Notification, Order, Message
from django.views.decorators.http import require_http_methods

def index(request ):
    featured_birds = Bird.objects.filter(is_featured=True, listing_type='sell')[:6]
    featured_vets = []
    featured_blog_posts = []
    
    context = {
        'featured_birds': featured_birds,
        'featured_vets': featured_vets,
        'featured_blog_posts': featured_blog_posts,
    }
    return render(request, 'index.html', context)

def marketplace(request):
    birds = Bird.objects.filter(listing_type='sell')
    
    breed_filter = request.GET.get('breed')
    health_filter = request.GET.get('health_status')
    location_filter = request.GET.get('location')
    sort = request.GET.get('sort', '-created_at')
    
    if breed_filter:
        birds = birds.filter(breed__icontains=breed_filter)
    if health_filter:
        birds = birds.filter(health_status=health_filter)
    if location_filter:
        birds = birds.filter(location__icontains=location_filter)
    
    birds = birds.order_by(sort)
    
    page = request.GET.get('page', 1)
    per_page = 12
    total_pages = (birds.count() + per_page - 1) // per_page
    
    start = (int(page) - 1) * per_page
    end = start + per_page
    birds_page = birds[start:end]
    
    context = {
        'birds': birds_page,
        'current_page': int(page),
        'total_pages': total_pages,
        'total_birds': birds.count(),
    }
    return render(request, 'marketplace.html', context)

def bird_detail(request, bird_id):
    bird = get_object_or_404(Bird, id=bird_id)
    bird.views += 1
    bird.save()
    
    seller = bird.seller
    related_birds = Bird.objects.filter(species=bird.species, listing_type='sell').exclude(id=bird_id)[:4]
    reviews = bird.order_set.filter(review__isnull=False).select_related('review')
    
    context = {
        'bird': bird,
        'seller': seller,
        'related_birds': related_birds,
        'reviews': reviews,
    }
    return render(request, 'bird-detail.html', context)

def search_results(request):
    query = request.GET.get('q', '')
    birds = Bird.objects.filter(listing_type='sell')
    
    if query:
        birds = birds.filter(
            Q(breed__icontains=query) |
            Q(species__icontains=query) |
            Q(location__icontains=query)
        )
    
    context = {
        'birds': birds,
        'query': query,
        'total_results': birds.count(),
    }
    return render(request, 'search-results.html', context)

@login_required
def cart(request):
    cart, created = Cart.objects.get_or_create(user=request.user)
    cart_items = cart.cartitem_set.all()
    
    subtotal = sum(item.bird.price * item.quantity for item in cart_items)
    shipping_cost = 50 if subtotal > 0 else 0
    tax = subtotal * 0.1
    total = subtotal + shipping_cost + tax
    
    context = {
        'cart': cart,
        'cart_items': cart_items,
        'subtotal': subtotal,
        'shipping_cost': shipping_cost,
        'tax': tax,
        'total': total,
    }
    return render(request, 'cart.html', context)

@login_required
def wishlist(request):
    wishlist, created = Wishlist.objects.get_or_create(user=request.user)
    wishlist_items = wishlist.birds.all()
    
    context = {
        'wishlist': wishlist,
        'wishlist_items': wishlist_items,
        'total_items': wishlist_items.count(),
    }
    return render(request, 'wishlist.html', context)

@login_required
def checkout(request):
    cart, created = Cart.objects.get_or_create(user=request.user)
    cart_items = cart.cartitem_set.all()
    
    if not cart_items:
        return redirect('cart')
    
    subtotal = sum(item.bird.price * item.quantity for item in cart_items)
    shipping_cost = 50
    tax = subtotal * 0.1
    total = subtotal + shipping_cost + tax
    
    context = {
        'cart_items': cart_items,
        'subtotal': subtotal,
        'shipping_cost': shipping_cost,
        'tax': tax,
        'total': total,
    }
    return render(request, 'checkout.html', context)

@login_required
def order_tracking(request, order_id=None):
    if order_id:
        order = get_object_or_404(Order, id=order_id, buyer=request.user)
        orders = [order]
    else:
        orders = Order.objects.filter(buyer=request.user).order_by('-created_at')
    
    context = {
        'orders': orders,
    }
    return render(request, 'order-tracking.html', context)

@login_required
def chat(request, user_id=None):
    if user_id:
        other_user = get_object_or_404(User, id=user_id)
        messages = Message.objects.filter(
            Q(sender=request.user, recipient=other_user) |
            Q(sender=other_user, recipient=request.user)
        ).order_by('created_at')
        
        Message.objects.filter(sender=other_user, recipient=request.user).update(is_read=True)
    else:
        messages = []
        other_user = None
    
    context = {
        'messages': messages,
        'other_user': other_user,
    }
    return render(request, 'chat.html', context)

@login_required
def profile(request, user_id):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    user = get_object_or_404(User, id=user_id)
    user_birds = Bird.objects.filter(seller=user)
    user_reviews = Review.objects.filter(reviewer=user)
    
    context = {
        'profile_user': user,
        'user_birds': user_birds,
        'user_reviews': user_reviews,
    }
    return render(request, 'profile.html', context)

@login_required
def settings(request):
    context = {}
    return render(request, 'settings.html', context)

@login_required
def notifications(request):
    user_notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
    unread_count = user_notifications.filter(is_read=False).count()
    
    context = {
        'notifications': user_notifications,
        'unread_count': unread_count,
    }
    return render(request, 'notifications.html', context)

@login_required
def report_abuse(request):
    context = {}
    return render(request, 'report-abuse.html', context)

def vet_locator(request):
    context = {}
    return render(request, 'vet-locator.html', context)

def blog(request):
    context = {}
    return render(request, 'blog.html', context)

def blog_detail(request, post_id):
    context = {}
    return render(request, 'blog-detail.html', context)

@login_required
def buyer_dashboard(request):
    if request.user.user_type != 'buyer':
        return redirect('index')
    
    orders = Order.objects.filter(buyer=request.user).order_by('-created_at')[:5]
    wishlist = Wishlist.objects.filter(user=request.user).first()
    
    context = {
        'orders': orders,
        'wishlist': wishlist,
    }
    return render(request, 'buyer-dashboard.html', context)

@login_required
def seller_dashboard(request):
    if request.user.user_type != 'seller':
        return redirect('index')
    
    birds = Bird.objects.filter(seller=request.user)
    orders = Order.objects.filter(bird__seller=request.user).order_by('-created_at')
    
    context = {
        'birds': birds,
        'orders': orders,
    }
    return render(request, 'seller-dashboard.html', context)

@login_required
def vet_dashboard(request):
    if request.user.user_type != 'vet':
        return redirect('index')
    
    context = {}
    return render(request, 'vet-dashboard.html', context)

@login_required
def admin_dashboard(request):
    if not request.user.is_staff:
        return redirect('index')
    
    context = {}
    return render(request, 'admin-dashboard.html', context)