from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.authtoken.models import Token

from .models import Member


class MessageSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=200)
    timestamp = serializers.DateTimeField(read_only=True)


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = [
            "id",
            "username",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
        ]


class RegisterSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)
    token = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    def validate_username(self, value: str) -> str:
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "A user with this username already exists.",
            )
        return value

    def create(self, validated_data):
        username = validated_data["username"]
        password = validated_data["password"]

        user = User(username=username)
        user.set_password(password)
        user.save()

        member = Member.objects.create(
            user=user,
            username=user.username,
        )
        token, _ = Token.objects.get_or_create(user=user)

        return {
            "id": member.id,
            "username": member.username,
            "created_at": member.created_at,
            "token": token.key,
        }


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    id = serializers.IntegerField(read_only=True)
    token = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        if not username or not password:
            raise serializers.ValidationError(
                "Both username and password are required.",
            )

        request = self.context.get("request")
        user = authenticate(
            request=request,
            username=username,
            password=password,
        )
        if user is None:
            raise serializers.ValidationError(
                "Invalid username or password.",
            )

        try:
            member = user.member
        except Member.DoesNotExist:
            member = Member.objects.create(
                user=user,
                username=user.username,
            )

        token, _ = Token.objects.get_or_create(user=user)

        attrs["id"] = member.id
        attrs["created_at"] = member.created_at
        attrs["token"] = token.key
        return attrs
