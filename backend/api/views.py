from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django.db.models import Q

from .models import Student, Expense, ExpenseShare
from .serializers import (
    RegisterSerializer,
    LogoutSerializer,
    StudentSerializer,
    StudentUpdateSerializer,
    ExpenseSerializer,
    ExpenseShareSerializer,
)

# ---------------------------
# Authentication / Profile
# ---------------------------

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class LogoutView(generics.GenericAPIView):
    serializer_class = LogoutSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Logout successful"}, status=status.HTTP_204_NO_CONTENT)


class StudentProfileView(generics.RetrieveAPIView):
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        if not hasattr(self.request.user, "student_profile"):
            raise PermissionDenied("Profile does not exist.")
        return self.request.user.student_profile


class StudentUpdateProfileView(generics.UpdateAPIView):
    serializer_class = StudentUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        if not hasattr(self.request.user, "student_profile"):
            raise PermissionDenied("Profile does not exist.")
        return self.request.user.student_profile


# ---------------------------
# Friends Management
# ---------------------------

class FriendListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        student = request.user.student_profile
        friends = student.friends.all()
        serializer = StudentSerializer(friends, many=True)
        return Response(serializer.data)


class AddFriendView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        username = request.data.get("username")
        if not username:
            return Response({"detail": "Username is required."}, status=status.HTTP_400_BAD_REQUEST)

        student = request.user.student_profile
        try:
            friend_user = User.objects.get(username=username)
            friend = friend_user.student_profile
        except (User.DoesNotExist, Student.DoesNotExist):
            return Response({"detail": "User not found or has no profile."}, status=status.HTTP_404_NOT_FOUND)

        if friend == student:
            return Response({"detail": "You cannot add yourself as a friend."}, status=status.HTTP_400_BAD_REQUEST)

        if student.friends.filter(id=friend.id).exists():
            return Response({"detail": "Already friends."}, status=status.HTTP_400_BAD_REQUEST)

        student.friends.add(friend)
        return Response({"detail": f"{friend.user.username} added as friend"}, status=status.HTTP_201_CREATED)


class RemoveFriendView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        student = request.user.student_profile
        friend = get_object_or_404(Student, pk=pk)
        if not student.friends.filter(pk=friend.pk).exists():
            return Response({"detail": "Not in your friends list."}, status=status.HTTP_400_BAD_REQUEST)
        student.friends.remove(friend)
        return Response({"detail": f"{friend.user.username} removed from friends"}, status=status.HTTP_204_NO_CONTENT)


# ---------------------------
# Expenses
# ---------------------------

class ExpenseListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Show expenses where user is payer OR payee
        expenses = (
            Expense.objects.filter(Q(payer=request.user) | Q(shares__payee=request.user))
            .distinct()
            .order_by("-created_at")
        )
        serializer = ExpenseSerializer(expenses, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ExpenseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(payer=request.user)  # Only payer creates expenses
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExpenseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        return get_object_or_404(
            Expense.objects.filter(Q(payer=user) | Q(shares__payee=user)).distinct(),
            pk=pk,
        )

    def get(self, request, pk):
        expense = self.get_object(pk, request.user)
        serializer = ExpenseSerializer(expense)
        return Response(serializer.data)

    def put(self, request, pk):
        expense = self.get_object(pk, request.user)
        if expense.payer != request.user:
            raise PermissionDenied("Only the payer can update this expense.")
        serializer = ExpenseSerializer(expense, data=request.data)
        if serializer.is_valid():
            serializer.save(payer=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        expense = self.get_object(pk, request.user)
        if expense.payer != request.user:
            raise PermissionDenied("Only the payer can update this expense.")
        serializer = ExpenseSerializer(expense, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(payer=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        expense = self.get_object(pk, request.user)
        if expense.payer != request.user:
            raise PermissionDenied("Only the payer can delete this expense.")
        expense.delete()
        return Response({"detail": "Expense deleted"}, status=status.HTTP_204_NO_CONTENT)


# ---------------------------
# Expense Shares
# ---------------------------

class ExpenseShareListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, expense_id):
        # Allow payer and payees to see shares
        expense = get_object_or_404(
            Expense.objects.filter(Q(payer=request.user) | Q(shares__payee=request.user)).distinct(),
            pk=expense_id,
        )
        shares = expense.shares.all()
        serializer = ExpenseShareSerializer(shares, many=True)
        return Response(serializer.data)

    def post(self, request, expense_id):
        # Only payer can add shares
        expense = get_object_or_404(Expense, pk=expense_id, payer=request.user)
        serializer = ExpenseShareSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(expense=expense)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExpenseShareDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        return get_object_or_404(
            ExpenseShare.objects.filter(Q(expense__payer=user) | Q(payee=user)).distinct(),
            pk=pk,
        )

    def get(self, request, pk):
        share = self.get_object(pk, request.user)
        serializer = ExpenseShareSerializer(share)
        return Response(serializer.data)

    def put(self, request, pk):
        share = self.get_object(pk, request.user)
        if share.expense.payer != request.user:
            raise PermissionDenied("Only the payer can update shares.")
        serializer = ExpenseShareSerializer(share, data=request.data)
        if serializer.is_valid():
            serializer.save(expense=share.expense)  # ensure expense link is preserved
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        share = self.get_object(pk, request.user)
        if share.expense.payer != request.user:
            raise PermissionDenied("Only the payer can update shares.")
        serializer = ExpenseShareSerializer(share, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(expense=share.expense)  # ensure expense link is preserved
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        share = self.get_object(pk, request.user)
        if share.expense.payer != request.user:
            raise PermissionDenied("Only the payer can delete shares.")
        share.delete()
        return Response({"detail": "Expense share deleted"}, status=status.HTTP_204_NO_CONTENT)
