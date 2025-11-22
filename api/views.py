from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status, permissions, authentication
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Member
from .serializers import (
    MessageSerializer,
    RegisterSerializer,
    LoginSerializer,
    MemberSerializer,
)


class HelloView(APIView):
    """A simple API endpoint that returns a greeting message."""

    @extend_schema(
        responses={200: MessageSerializer},
        description="Get a hello world message",
    )
    def get(self, request):
        data = {
            "message": "Hello!",
            "timestamp": timezone.now(),
        }
        serializer = MessageSerializer(data)
        return Response(serializer.data)


class RegisterView(APIView):
    """Register a new user and associated Member profile."""

    authentication_classes = [
        authentication.TokenAuthentication,
        authentication.SessionAuthentication,
    ]
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=RegisterSerializer,
        responses={201: RegisterSerializer},
        description=(
            "Register a new user, create a linked Member, and return an auth token."
        ),
    )
    def post(self, request):
        serializer = RegisterSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """Authenticate an existing user and return a token."""

    authentication_classes = [
        authentication.TokenAuthentication,
        authentication.SessionAuthentication,
    ]
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=LoginSerializer,
        responses={200: LoginSerializer},
        description=(
            "Authenticate a user using username and password and return an auth token."
        ),
    )
    def post(self, request):
        serializer = LoginSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """Log out the current user by deleting their token."""

    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: None},
        description="Log out the current user by deleting their auth token.",
    )
    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(
            {"detail": "Logged out."},
            status=status.HTTP_200_OK,
        )


class CurrentMemberView(APIView):
    """Return the profile for the current authenticated Member."""

    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: MemberSerializer},
        description="Get the Member profile for the currently authenticated user.",
    )
    def get(self, request):
        try:
            member = request.user.member
        except Member.DoesNotExist:
            return Response(
                {"detail": "Member profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = MemberSerializer(member)
        return Response(serializer.data, status=status.HTTP_200_OK)
