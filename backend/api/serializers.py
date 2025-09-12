from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Student, Expense

# ---------------------------
# Registration / Logout
# ---------------------------

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        # Create the User
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()

        # Create Student profile if it doesn't exist
        if not hasattr(user, "student_profile"):
            Student.objects.create(user=user)

        return user


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate(self, attrs):
        self.token = attrs['refresh']
        return attrs

    def save(self, **kwargs):
        try:
            token = RefreshToken(self.token)
            token.blacklist()
        except Exception:
            self.fail('bad_token')


# ---------------------------
# User / Student Serialization
# ---------------------------

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]


class FriendSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Student
        fields = ["id", "user"]


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    friends = FriendSerializer(many=True, read_only=True)

    class Meta:
        model = Student
        fields = ["user", "department", "wallet_balance", "friends"]


class StudentUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)

    class Meta:
        model = Student
        fields = ['department', 'first_name', 'last_name']

    def update(self, instance, validated_data):
        # Update Student fields
        instance.department = validated_data.get('department', instance.department)
        instance.save()

        # Update related User fields
        user_data = validated_data.get('user', {})
        user = instance.user
        user.first_name = user_data.get('first_name', user.first_name)
        user.last_name = user_data.get('last_name', user.last_name)
        user.save()

        return instance


# ---------------------------
# Expenses Serialization
# ---------------------------

class ExpenseSerializer(serializers.ModelSerializer):
    # For GET requests
    people = FriendSerializer(many=True, read_only=True)
    # For POST/PUT requests
    people_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=Student.objects.all(),
        source="people"
    )

    class Meta:
        model = Expense
        fields = ["id", "student", "title", "amount", "description", "date", "people", "people_ids"]
        read_only_fields = ["id", "date", "student"]
