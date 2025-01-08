from django.urls import path
from . import views

urlpatterns = [
    path('follow/', views.follow_user, name='follow_user'),
    path('friend-request/', views.send_friend_request, name='send_friend_request'),
    path('block/', views.block_user, name='block_user'),
    path('unblock/', views.unblock_user, name='unblock_user'),

    path('test-page/', views.test_page, name='test_page'),
 
]
