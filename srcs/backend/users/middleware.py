# from django.http import JsonResponse

# class CorsPreflightMiddleware:
#     def __init__(self, get_response):
#         self.get_response = get_response

#     def __call__(self, request):
#         if request.method == 'OPTIONS':
#             response = JsonResponse({'detail': 'Preflight OK'})
#             response['Access-Control-Allow-Origin'] = 'https://10.11.243.162'  # Frontend URL
#             response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
#             response['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, X-CSRFToken'
#             response['Access-Control-Allow-Credentials'] = 'true'
#             return response
#         return self.get_response(request)