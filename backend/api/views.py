from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from rest_framework import generics, status, viewsets, permissions
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django.db.models import Q

from .models import Student, Expense
from .serializers import (
    RegisterSerializer,
    LogoutSerializer,
    StudentSerializer,
    StudentUpdateSerializer,
    FriendSerializer,
    ExpenseSerializer
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
        try:
            return self.request.user.student_profile
        except Student.DoesNotExist:
            raise PermissionDenied("Profile does not exist.")


class StudentUpdateProfileView(generics.UpdateAPIView):
    serializer_class = StudentUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        try:
            return self.request.user.student_profile
        except Student.DoesNotExist:
            raise PermissionDenied("Profile does not exist.")


# ---------------------------
# Friends Management
# ---------------------------

class FriendListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        student = request.user.student_profile
        friends = student.friends.all()
        serializer = FriendSerializer(friends, many=True)
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

        student.friends.add(friend)
        return Response({"detail": f"{friend.user.username} added as friend"}, status=status.HTTP_201_CREATED)


class RemoveFriendView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        student = request.user.student_profile
        friend = get_object_or_404(Student, pk=pk)
        student.friends.remove(friend)
        return Response({"detail": f"{friend.user.username} removed from friends"}, status=status.HTTP_204_NO_CONTENT)


# ---------------------------
# Expenses CRUD
# ---------------------------

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    queryset = Expense.objects.all()  # Needed for schema & browsable API

    def get_queryset(self):
        student = getattr(self.request.user, "student_profile", None)
        if not student:
            return Expense.objects.none()
        # Return expenses created by student OR shared with student
        return Expense.objects.filter(Q(student=student) | Q(people=student)).distinct()

    def perform_create(self, serializer):
        student = self.request.user.student_profile
        # Save expense
        instance = serializer.save(student=student)

        # Attach people from people_ids
        people_ids = self.request.data.get("people_ids", [])
        people_objs = Student.objects.filter(id__in=people_ids)
        if student not in people_objs:
            people_objs = list(people_objs) + [student]
        instance.people.set(people_objs)

    def perform_update(self, serializer):
        # Ensure the student is not changed
        serializer.save(student=self.request.user.student_profile)

    def perform_destroy(self, instance):
        student = self.request.user.student_profile
        if instance.student != student:
            raise PermissionDenied("You can only delete your own expenses.")
        instance.delete()
