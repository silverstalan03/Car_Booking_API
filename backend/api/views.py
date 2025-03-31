from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework import status
from .models import User, Car, CarAvailability, UserFavoriteCar, UserCart, RecommendedCar, Booking
from .serializer import UserSerializer, CarSerializer, CarAvailabilitySerializer
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken
from backendpandacar.custom_classes import CustomAuthentication
from rest_framework.throttling import ScopedRateThrottle
import logging
from datetime import datetime
import json
import random
from django.views.decorators.csrf import csrf_exempt

logger = logging.getLogger(__name__)

# Custom Token View
class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        data = response.data
        access_token = data.get('access')

        try:
            token = AccessToken(access_token)
            user_id = token.payload.get('user_id')  
            user = User.objects.get(id=user_id)
            role = 'admin' if user.is_admin else 'user'
            print(f"Setting access token for user {user.email}")
        except Exception as e:
            print(f"Token validation error: {str(e)}")
            return Response({'detail': 'Invalid token or user not found'}, status=status.HTTP_400_BAD_REQUEST)

        # For local development - don't use secure cookies with HTTP
        response.set_cookie(
            key='access_token',
            value=data['access'],
            httponly=True,
            samesite='Lax',  # Changed from 'None' to 'Lax' for better compatibility
            secure=False,  # Must be False for HTTP in local development
            max_age=86400  # 24 hours in seconds
        )
        response.set_cookie(
            key="refresh_token",
            value=data['refresh'],
            httponly=True,
            samesite='Lax',  # Changed from 'None' to 'Lax'
            secure=False,  # Must be False for HTTP in local development
            max_age=604800  # 7 days in seconds
        )

        del response.data['access']
        del response.data['refresh']
        response.data = {'message': 'Login successful', 'role': role, 'user_id': user_id}

        return response

# User views
@api_view(['GET'])
@authentication_classes([CustomAuthentication])
@permission_classes([IsAdminUser])
def get_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([])  # No authentication needed for registration
@permission_classes([AllowAny])  # Allow anyone to register
def create_user(request):
    print("Registration request received:", request.data)
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        is_admin = request.data.get('is_admin', False)
        if is_admin:
            user.is_admin = True
            user.is_staff = True
            user.save()
        print(f"User created successfully: {user.email}")
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    print(f"User creation failed: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET','PUT','DELETE'])
@authentication_classes([CustomAuthentication])
@permission_classes([IsAdminUser])
def user_detail(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Car views
@api_view(['GET'])
@authentication_classes([CustomAuthentication])
def get_cars(request):
    print(f"User in get_cars: {request.user}")
    cars = Car.objects.all()
    serializer = CarSerializer(cars, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([CustomAuthentication])
@permission_classes([IsAdminUser])
def create_car(request):
    serializer = CarSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET','PUT','DELETE'])
@authentication_classes([CustomAuthentication])
def car_detail(request, pk):
    try:
        car = Car.objects.get(pk=pk)
    except Car.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = CarSerializer(car)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = CarSerializer(car, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        car.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Basic movie and food endpoints
@api_view(['GET'])
@authentication_classes([])  # No authentication required
@permission_classes([AllowAny])  # Allow anyone to access
def available_movies(request):
    # Sample data for movies
    movies = [
        {"id": 1, "title": "The Matrix", "genre": "Sci-Fi", "duration": 136},
        {"id": 2, "title": "Inception", "genre": "Sci-Fi", "duration": 148},
        {"id": 3, "title": "Interstellar", "genre": "Sci-Fi", "duration": 169},
        {"id": 4, "title": "The Dark Knight", "genre": "Action", "duration": 152},
        {"id": 5, "title": "Pulp Fiction", "genre": "Crime", "duration": 154},
        {"id": 6, "title": "The Shawshank Redemption", "genre": "Drama", "duration": 142}
    ]
    return Response(movies, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([])  # No authentication required
@permission_classes([AllowAny])  # Allow anyone to access
def available_foods(request):
    # Sample data for foods
    foods = [
        {"id": 1, "name": "Popcorn", "price": 5.99},
        {"id": 2, "name": "Nachos", "price": 7.99},
        {"id": 3, "name": "Soft Drink", "price": 3.99},
        {"id": 4, "name": "Candy", "price": 4.99},
        {"id": 5, "name": "Hot Dog", "price": 6.99},
        {"id": 6, "name": "Ice Cream", "price": 4.99}
    ]
    return Response(foods, status=status.HTTP_200_OK)

# Authentication views
@api_view(['POST'])
@authentication_classes([])  # No authentication required for logout
@permission_classes([AllowAny])  # Allow anyone to logout
def logout_user(request):
    print("Logout request received")
    
    response = Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)
    
    # Delete the authentication cookies
    try:
        print("Deleting access_token cookie")
        response.delete_cookie('access_token', path='/', domain=None)
        print("Deleting refresh_token cookie")
        response.delete_cookie('refresh_token', path='/', domain=None)
    except Exception as e:
        print(f"Error deleting cookies: {str(e)}")
    
    print("Logout process completed")
    return response

@api_view(['GET'])
@authentication_classes([CustomAuthentication])
def my_account_details(request):
    print(f"User in my_account_details: {request.user}, Auth: {request.user.is_authenticated}")
    
    # Check if user is authenticated
    if not request.user.is_authenticated:
        print("User not authenticated in my_account_details")
        return Response({"error": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        user = request.user
        serializer = UserSerializer(user)
        print(f"Returning user details for {user.email}")
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"Error in my_account_details: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Car availability
@api_view(['GET'])
@authentication_classes([CustomAuthentication])
def get_cars_availability(request):
    cars_availabilities = CarAvailability.objects.all()
    serializer = CarAvailabilitySerializer(cars_availabilities, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([CustomAuthentication])
@permission_classes([IsAdminUser])
def create_car_availability(request):
    serializer = CarAvailabilitySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET','PUT','DELETE'])
@authentication_classes([CustomAuthentication])
def car_detail_availability(request, pk):
    try:
        cars_availability = CarAvailability.objects.get(pk=pk)
    except CarAvailability.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = CarAvailabilitySerializer(cars_availability)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = CarAvailabilitySerializer(cars_availability, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        cars_availability.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Favorites functionality
@api_view(['POST'])
@authentication_classes([CustomAuthentication])
def add_to_favorites(request, car_id):
    try:
        car = Car.objects.get(pk=car_id)
        user = request.user
        if not UserFavoriteCar.objects.filter(user=user, car=car).exists():
            UserFavoriteCar.objects.create(user=user, car=car)
            return Response({"message": f"Added to favorites"}, status=status.HTTP_201_CREATED)
        return Response({"message": "Already in favorites"}, status=status.HTTP_200_OK)
    except Car.DoesNotExist:
        return Response({"error": "Car not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@authentication_classes([CustomAuthentication])
def get_user_favorites(request):
    user = request.user
    favorites = UserFavoriteCar.objects.filter(user=user)
    cars = [favorite.car for favorite in favorites]
    serializer = CarSerializer(cars, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@authentication_classes([CustomAuthentication])
def remove_from_favorites(request, car_id):
    try:
        car = Car.objects.get(pk=car_id)
        user = request.user
        UserFavoriteCar.objects.filter(user=user, car=car).delete()
        return Response({"message": "Removed from favorites"}, status=status.HTTP_200_OK)
    except Car.DoesNotExist:
        return Response({"error": "Car not found"}, status=status.HTTP_404_NOT_FOUND)

# Cart functionality
@api_view(['POST'])
@authentication_classes([CustomAuthentication])
def add_to_cart(request, car_id):
    try:
        car = Car.objects.get(pk=car_id)
        user = request.user
        if not UserCart.objects.filter(user=user, car=car).exists():
            UserCart.objects.create(user=user, car=car)
            return Response({"message": "Added to cart"}, status=status.HTTP_201_CREATED)
        return Response({"message": "Already in cart"}, status=status.HTTP_200_OK)
    except Car.DoesNotExist:
        return Response({"error": "Car not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@authentication_classes([CustomAuthentication])
def get_user_cart(request):
    user = request.user
    cart_items = UserCart.objects.filter(user=user)
    cars = [item.car for item in cart_items]
    serializer = CarSerializer(cars, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@authentication_classes([CustomAuthentication])
def remove_from_cart(request, car_id):
    try:
        car = Car.objects.get(pk=car_id)
        user = request.user
        UserCart.objects.filter(user=user, car=car).delete()
        return Response({"message": "Removed from cart"}, status=status.HTTP_200_OK)
    except Car.DoesNotExist:
        return Response({"error": "Car not found"}, status=status.HTTP_404_NOT_FOUND)

# Basic recommendation endpoint
@api_view(['GET'])
@authentication_classes([CustomAuthentication])
def recommended_cars(request):
    # This is a simplified version, not using complex ML
    all_cars = Car.objects.all()[:4]  # Just return 4 random cars as recommendations
    serializer = CarSerializer(all_cars, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

# Booking functionality
@api_view(['POST'])
@authentication_classes([CustomAuthentication])
def create_booking(request):
    # Check if user is authenticated
    print(f"User in create_booking: {request.user}, Auth: {request.user.is_authenticated}")
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required. Please log in."}, 
                       status=status.HTTP_401_UNAUTHORIZED)
    
    user = request.user
    
    # Print request data for debugging
    print("Booking request data:", request.data)
    
    # Validate required fields
    required_fields = ['car_id', 'start_date', 'end_date']
    for field in required_fields:
        if field not in request.data:
            return Response({"error": f"Missing required field: {field}"}, 
                           status=status.HTTP_400_BAD_REQUEST)
    
    car_id = request.data.get('car_id')
    start_date = request.data.get('start_date')
    end_date = request.data.get('end_date')
    booking_time = request.data.get('booking_time', '19:00')  # Default to 7PM if not provided
    
    try:
        car = Car.objects.get(id=car_id)
        
        # Parse dates and validate
        try:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD"}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate days and price
        days = (end - start).days + 1
        if days < 1:
            return Response({"error": "End date must be after or same as start date"}, 
                           status=status.HTTP_400_BAD_REQUEST)
            
        total_price = days * car.price_per_day
        
        # Create the booking
        booking = Booking.objects.create(
            user=user,
            car=car,
            start_date=start,
            end_date=end,
            total_price=total_price
        )
        
        # Determine category based on price
        category = "economy"
        if car.price_per_day >= 80:
            category = "luxury"
        elif car.price_per_day >= 55:
            category = "medium"
        
        # Create receipt
        receipt = {
            "booking_id": booking.id,
            "car": car.car_name,
            "category": category,
            "start_date": start_date,
            "end_date": end_date,
            "booking_time": booking_time,
            "days": days,
            "price_per_day": car.price_per_day,
            "price": f"€{total_price}",
            "total_price": total_price
        }
        
        return Response({"message": "Booking created", "receipt": receipt}, 
                       status=status.HTTP_201_CREATED)
    
    except Car.DoesNotExist:
        return Response({"error": "Car not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Booking error: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Cancel booking endpoint
@api_view(['DELETE'])
@authentication_classes([CustomAuthentication])
def cancel_booking(request, booking_id):
    print(f"Cancelling booking {booking_id}")
    try:
        # Find the booking
        booking = Booking.objects.get(id=booking_id)
        
        # Check if the user owns this booking
        if booking.user != request.user and not request.user.is_admin:
            return Response({"error": "You don't have permission to cancel this booking"}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        # Delete the booking
        booking.delete()
        return Response({"message": "Booking cancelled successfully"}, 
                       status=status.HTTP_200_OK)
    
    except Booking.DoesNotExist:
        return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Cancel booking error: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Get user bookings endpoint
@api_view(['GET'])
@authentication_classes([CustomAuthentication])
def get_user_bookings(request):
    print(f"User in get_user_bookings: {request.user}")
    
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        user = request.user
        bookings = Booking.objects.filter(user=user).order_by('-start_date')
        
        # Create custom response with required fields
        booking_data = []
        for booking in bookings:
            # Determine category based on price
            category = "economy"
            if booking.car.price_per_day >= 80:
                category = "luxury"
            elif booking.car.price_per_day >= 55:
                category = "medium"
                
            booking_data.append({
                "booking_id": booking.id,
                "car": booking.car.car_name,
                "category": category,
                "start_date": booking.start_date.strftime('%Y-%m-%d'),
                "end_date": booking.end_date.strftime('%Y-%m-%d'),
                "booking_time": "19:00",  # Default value since not stored
                "days": (booking.end_date - booking.start_date).days + 1,
                "price_per_day": booking.car.price_per_day,
                "total_price": booking.total_price,
                "price": f"€{booking.total_price}"
            })
        
        return Response(booking_data, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"Error in get_user_bookings: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# User self-deletion endpoint
@api_view(['DELETE'])
@authentication_classes([CustomAuthentication])
def delete_account(request):
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        user = request.user
        print(f"Deleting user account: {user.email}")
        
        # Delete the user
        user.delete()
        
        # Return success response with cookie clearing
        response = Response({"message": "Account successfully deleted"}, status=status.HTTP_200_OK)
        response.delete_cookie('access_token', path='/', domain=None)
        response.delete_cookie('refresh_token', path='/', domain=None)
        
        return response
    except Exception as e:
        print(f"Error deleting user account: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Local booking functionality (no authentication required)
@api_view(['POST'])
@authentication_classes([])  # No authentication required
@permission_classes([AllowAny])  # Allow anyone to access
def create_local_booking(request):
    """
    Handle local booking creation without authentication requirements
    """
    try:
        # Parse the request body
        data = json.loads(request.body)
        
        # Print received data for debugging
        print("Local booking request data:", data)
        
        # Generate a unique booking ID (smaller than the client-side one for differentiation)
        booking_id = random.randint(100, 999)
        
        # Extract booking details
        car_name = data.get('car_name', 'Unknown Car')
        category = data.get('category', 'unknown')
        booking_date = data.get('start_date', datetime.today().isoformat())
        booking_time = data.get('booking_time', '19:00')
        price = data.get('price', 0)
        
        # Create receipt object
        receipt = {
            "booking_id": booking_id,
            "car": car_name,
            "category": category,
            "booking_date": booking_date,
            "booking_time": booking_time,
            "price": f"€{price}",
            "created_at": datetime.now().isoformat(),
            "server_processed": True
        }
        
        # Log the booking (in a real app, you would save to database)
        print(f"Local booking created: {receipt}")
        
        return Response({
            "status": "success",
            "message": "Booking created successfully",
            "receipt": receipt
        }, status=status.HTTP_201_CREATED)
    
    except json.JSONDecodeError:
        return Response({
            "status": "error",
            "message": "Invalid JSON data"
        }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        print(f"Error creating local booking: {str(e)}")
        return Response({
            "status": "error",
            "message": f"Server error: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@authentication_classes([])  # No authentication required
@permission_classes([AllowAny])  # Allow anyone to access
def cancel_local_booking(request, booking_id):
    """
    Handle local booking cancellation without authentication requirements
    """
    try:
        # In a real app, you would delete from database
        print(f"Local booking cancelled: {booking_id}")
        
        return Response({
            "status": "success",
            "message": f"Booking {booking_id} cancelled successfully"
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        print(f"Error cancelling local booking: {str(e)}")
        return Response({
            "status": "error",
            "message": f"Server error: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)