from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status, permissions, authentication
from rest_framework.authtoken.models import Token
from rest_framework.generics import ListCreateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Member, Message
from .serializers import (
    HelloMessageSerializer,
    RegisterSerializer,
    LoginSerializer,
    MemberSerializer,
    ChatMessageSerializer,
)


class HelloView(APIView):
    """A simple API endpoint that returns a greeting message."""

    @extend_schema(
        responses={200: HelloMessageSerializer},
        description="Get a hello world message",
    )
    def get(self, request):
        data = {
            "message": "Hello!",
            "timestamp": timezone.now(),
        }
        serializer = HelloMessageSerializer(data)
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


class ProfileView(APIView):
    """Return the profile for the current authenticated Member (profile endpoint)."""

    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: MemberSerializer},
        description="Get the Member profile for the currently authenticated user (profile endpoint).",
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


class ChatMessagesView(ListCreateAPIView):
    """List and create messages in the group chat."""

    serializer_class = ChatMessageSerializer
    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        description="List chat messages in the group chat.",
        responses={200: ChatMessageSerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        description="Create a new chat message in the group chat.",
        request=ChatMessageSerializer,
        responses={201: ChatMessageSerializer},
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

    def get_queryset(self):
        queryset = Message.objects.select_related("member").order_by("created_at")
        limit_param = self.request.query_params.get("limit")
        if limit_param is not None:
            try:
                limit = int(limit_param)
            except (TypeError, ValueError):
                limit = None
            if limit is not None and limit > 0:
                queryset = queryset[:limit]
        return queryset
