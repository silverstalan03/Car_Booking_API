from django.urls import path
from . import views

urlpatterns = [
    # User routes
    path('users/', views.get_users, name='get_users'),
    path('users/create', views.create_user, name='create_user'),
    path('users/<int:pk>', views.user_detail, name='user_detail'),
    path('myaccount/', views.my_account_details, name='my_account_details'),
    
    # Car routes
    path('cars/', views.get_cars, name='get_cars'),
    path('cars/create', views.create_car, name='create_car'),
    path('cars/<int:pk>', views.car_detail, name='car_detail'),
    
    # Availability routes
    path('availabilities/', views.get_cars_availability, name='get_cars_availability'),
    path('availabilities/create', views.create_car_availability, name='create_car_availability'),
    path('availabilities/<int:pk>', views.car_detail_availability, name='car_detail_availability'),
    
    # Favorites routes
    path('favorites/', views.get_user_favorites, name='get_user_favorites'),
    path('favorites/add/<int:car_id>/', views.add_to_favorites, name='add_to_favorites'),
    path('favorites/remove/<int:car_id>/', views.remove_from_favorites, name='remove_from_favorites'),
    
    # Cart routes
    path('cart/', views.get_user_cart, name='get_user_cart'),
    path('cart/add/<int:car_id>/', views.add_to_cart, name='add_to_cart'),
    path('cart/remove/<int:car_id>/', views.remove_from_cart, name='remove_from_cart'),
    
    # Recommendations routes
    path('recommended/', views.recommended_cars, name='recommended_cars'),
    
    # Authentication routes
    path('login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('logout/', views.logout_user, name='logout_user'),
    
    # New Street Movie Car Booking routes
    path('movies/', views.available_movies, name='available_movies'),
    path('foods/', views.available_foods, name='available_foods'),
    path('bookings/create/', views.create_booking, name='create_booking'),
    path('bookings/cancel/<int:booking_id>/', views.cancel_booking, name='cancel_booking'),
    
    # NEW: Local booking API routes (no authentication required)
    path('local-bookings/', views.create_local_booking, name='create_local_booking'),
    path('local-bookings/cancel/<int:booking_id>/', views.cancel_local_booking, name='cancel_local_booking'),
]