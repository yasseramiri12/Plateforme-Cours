<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleCors
{
    public function handle(Request $request, Closure $next): Response
    {
        // Get the request origin
        $origin = $request->headers->get('origin');
        
        // Allowed origins - both addresses should work
        $allowedOrigins = [
            'http://localhost:8000',
            'http://127.0.0.1:8000',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
        ];
        
        // Set origin - use requested origin if in allowed list, otherwise use first allowed
        $allowedOrigin = (in_array($origin, $allowedOrigins)) ? $origin : 'http://localhost:8000';

        // For OPTIONS preflight requests, return immediately with CORS headers
        if ($request->getMethod() === 'OPTIONS') {
            return response('', Response::HTTP_NO_CONTENT)
                ->header('Access-Control-Allow-Origin', $allowedOrigin)
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD')
                ->header('Access-Control-Allow-Headers', 'Accept, Content-Type, Authorization, X-Requested-With, Accept-Language')
                ->header('Access-Control-Max-Age', '86400')
                ->header('Access-Control-Allow-Credentials', 'true')
                ->header('Vary', 'Origin');
        }

        // Process the actual request
        $response = $next($request);

        // Add CORS headers to the response
        $response->headers->set('Access-Control-Allow-Origin', $allowedOrigin, true);
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD', true);
        $response->headers->set('Access-Control-Allow-Headers', 'Accept, Content-Type, Authorization, X-Requested-With, Accept-Language', true);
        $response->headers->set('Access-Control-Allow-Credentials', 'true', true);
        $response->headers->set('Vary', 'Origin', true);

        return $response;
    }
}

