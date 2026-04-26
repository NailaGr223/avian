from django.urls import path
from . import views, api

app_name = 'marketplace'

urlpatterns = [
    # Main pages
    path('', views.index, name='index'),
    path('marketplace/', views.marketplace, name='marketplace'),
    path('bird/<int:bird_id>/', views.bird_detail, name='bird_detail'),
    path('search/', views.search_results, name='search_results'),
    
    # User pages
    path('cart/', views.cart, name='cart'),
    path('wishlist/', views.wishlist, name='wishlist'),
    path('checkout/', views.checkout, name='checkout'),
    path('order-tracking/', views.order_tracking, name='order_tracking'),
    path('order-tracking/<int:order_id>/', views.order_tracking, name='order_tracking_detail'),
    path('order-history/', views.order_history, name='order_history'),
    path('chat/', views.chat, name='chat'),
    path('chat/<int:user_id>/', views.chat, name='chat_detail'),
    path('profile/<int:user_id>/', views.profile, name='profile'),
    path('settings/', views.settings, name='settings'),
    path('notifications/', views.notifications, name='notifications'),
    path('report-abuse/', views.report_abuse, name='report_abuse'),
    
    # Other pages
    path('vet-locator/', views.vet_locator, name='vet_locator'),
    path('blog/', views.blog, name='blog'),
    path('blog/<int:post_id>/', views.blog_detail, name='blog_detail'),
    path('how-it-works/', views.how_it_works, name='how_it_works'),
    path('adoption-guide/', views.adoption_guide, name='adoption_guide'),
    
    # Dashboards
    path('buyer-dashboard/', views.buyer_dashboard, name='buyer_dashboard'),
    path('seller-dashboard/', views.seller_dashboard, name='seller_dashboard'),
    path('vet-dashboard/', views.vet_dashboard, name='vet_dashboard'),
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    
    # Verification pages
    path('seller-verification/', views.seller_verification, name='seller_verification'),
    path('vet-verification/', views.vet_verification, name='vet_verification'),
    
    # Payment and order pages
    path('payment-status/', views.payment_status, name='payment_status'),
    
    # API endpoints
    path('api/cart/add/<int:bird_id>/', api.add_to_cart, name='api_add_to_cart'),
    path('api/cart/remove/<int:item_id>/', api.remove_from_cart, name='api_remove_from_cart'),
    path('api/cart/update/<int:item_id>/', api.update_cart_quantity, name='api_update_cart'),
    path('api/cart/clear/', api.clear_cart, name='api_clear_cart'),
    
    path('api/notifications/', api.get_notifications, name='api_notifications'),
    path('api/notifications/mark-all-read/', api.mark_all_as_read, name='api_mark_all_read'),
    path('api/notifications/<int:notification_id>/read/', api.mark_notification_as_read, name='api_mark_read'),
    path('api/notifications/<int:notification_id>/delete/', api.delete_notification, name='api_delete_notification'),
    
    path('api/wishlist/toggle/<int:bird_id>/', api.toggle_wishlist, name='api_toggle_wishlist'),
    path('api/search/', api.search_birds, name='api_search_birds'),
]
