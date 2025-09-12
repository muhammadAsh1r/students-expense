from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, LogoutView,
    StudentProfileView, StudentUpdateProfileView,
    FriendListView, AddFriendView, RemoveFriendView,
    ExpenseViewSet
)

# DRF router for Expense CRUD
router = DefaultRouter()
router.register(r'expenses', ExpenseViewSet, basename="expense")

urlpatterns = [
    # Auth
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # Student profile
    path('profile/', StudentProfileView.as_view(), name='profile'),
    path('profile/update/', StudentUpdateProfileView.as_view(), name='profile-update'),

    # Friends management
    path('friends/', FriendListView.as_view(), name='friend-list'),
    path('friends/add/', AddFriendView.as_view(), name='add-friend'),
    path('friends/remove/<int:pk>/', RemoveFriendView.as_view(), name='remove-friend'),

    # Include router URLs (expenses)
    path('', include(router.urls)),
]
