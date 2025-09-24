from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Student, Expense, ExpenseShare


# ---------------------------
# Registration / Logout
# ---------------------------

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ("username", "email", "password")

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data["username"],
            email=validated_data["email"]
        )
        user.set_password(validated_data["password"])
        user.save()
        Student.objects.get_or_create(user=user)  # create Student profile
        return user


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate(self, attrs):
        self.token = attrs["refresh"]
        return attrs

    def save(self, **kwargs):
        try:
            RefreshToken(self.token).blacklist()
        except Exception:
            self.fail("bad_token")


# ---------------------------
# User / Student
# ---------------------------

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    friends = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all(), many=True)

    class Meta:
        model = Student
        fields = ["id", "user", "department", "wallet_balance", "friends"]


class StudentUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source="user.first_name", required=False)
    last_name = serializers.CharField(source="user.last_name", required=False)

    class Meta:
        model = Student
        fields = ["department", "first_name", "last_name"]

    def update(self, instance, validated_data):
        instance.department = validated_data.get("department", instance.department)
        instance.save()

        user_data = validated_data.get("user", {})
        user = instance.user
        user.first_name = user_data.get("first_name", user.first_name)
        user.last_name = user_data.get("last_name", user.last_name)
        user.save()

        return instance


# ---------------------------
# Expense
# ---------------------------

class ExpenseSerializer(serializers.ModelSerializer):
    payer_username = serializers.CharField(source="payer.username", read_only=True)
    payer_id = serializers.IntegerField(source="payer.id", read_only=True)

    class Meta:
        model = Expense
        fields = ["id", "title", "amount", "created_at", "payer_id", "payer_username"]



class ExpenseShareSerializer(serializers.ModelSerializer):
    payee_username = serializers.CharField(source="payee.username", read_only=True)

    class Meta:
        model = ExpenseShare
        fields = ["id", "expense", "payee", "payee_username", "amount"]
        read_only_fields = ['expense']
