from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView,
    LogoutView,
    StudentProfileView,
    StudentUpdateProfileView,
    FriendListView,
    AddFriendView,
    RemoveFriendView,
    ExpenseListCreateView,
    ExpenseDetailView,
    ExpenseShareListCreateView,
    ExpenseShareDetailView,
)

urlpatterns = [
    # Authentication
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),

    # Student profile
    path("profile/", StudentProfileView.as_view(), name="profile"),
    path("profile/update/", StudentUpdateProfileView.as_view(), name="profile-update"),

    # Friends
    path("friends/", FriendListView.as_view(), name="friend-list"),   
    path("friends/add/", AddFriendView.as_view(), name="friend-add"),
    path("friends/remove/<int:pk>/", RemoveFriendView.as_view(), name="friend-remove"),

    # Expenses
    path("expenses/", ExpenseListCreateView.as_view(), name="expense-list-create"),
    path("expenses/<int:pk>/", ExpenseDetailView.as_view(), name="expense-detail"),

    # Expense Shares
    path("expenses/<int:expense_id>/shares/", ExpenseShareListCreateView.as_view(), name="expense-share-list-create"),
    path("shares/<int:pk>/", ExpenseShareDetailView.as_view(), name="expense-share-detail"),
]
