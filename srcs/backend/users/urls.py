from django.urls import path
from .views import * #RegisterView, CSRFTokenView, LoginView, LogoutView, UserProfileView, RefreshTokenView, OAuthCallbackView, SetTwoFactorView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('get-csrf-token/', CSRFTokenView.as_view(), name='get-csrf-token'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('refresh/', RefreshTokenView.as_view(), name='refresh-token'),
    path('login42/', OAuthCallbackView.as_view(), name='login42'),
    path('setTwoFactor/', SetTwoFactorView.as_view(), name='setTwoFactor'),
    path('getQrCodeImage/', GetQrCode.as_view(), name='getQrCodeImage'),
    path('verifyTwoFactor/', VerifyTwoFactorView.as_view(), name='verifyTwoFactor'),
    path('upload-profile-pic/', UploadProfilePictureView.as_view(), name='upload-profile-pic'),
    path('user-bio/', UserBioView.as_view(), name='user-bio'),
    path('update-bio/', UpdateBioView.as_view(), name='update-bio'),

]
