##Live-Streaming MEAN

This Live-streaming application is built around the MEAN stack. It was designed to be integrated with NGINX-RTMP module and Ffmpeg video transcoder. Front-end uses VideoJS HTML5 player to display RTMP and HLS streams.

To install application:
 `git clone https://github.com/ReggiePuksta/streaming-app`
 `cd streaming-app`
 `npm install`
 
 Nginx-RTMP:
 https://github.com/arut/nginx-rtmp-module/wiki/Getting-started-with-nginx-rtmp
 
 Ffmpeg compilation:
 https://trac.ffmpeg.org/wiki/CompilationGuide/Ubuntu
 
 configuration.js filed is used to set-up according to your system.
 db: MongoDB url
 nginxStats: Nignx RTMP statistics URL object
 
 Nginx RTMP module has to be installed
 Suggested Nginx-RTMP configuration:
```
rtmp_auto_push on;
rtmp {
    server {
        listen 1935;
        chunk_size 4096;
        
        application src {
            live on;
            
            on_publish http://localhost:5000/stream_start;
            on_publish_done http://localhost:5000/stream_end;

            exec /home/reggie/bin/ffmpeg -i rtmp://localhost/src/$name
              -c:a libfdk_aac -b:a 96k  -c:v libx264 -s 640x360 -profile:v main -level 3.1 -r 30 -g 90 -b:v 1000K -preset ultrafast -sc_threshold 0 -f flv rtmp://localhost/hls/$name_low
              -c:a libfdk_aac -b:a 128k -c:v libx264 -s 1280x720 -profile:v main -level 4.0 -r 30 -g 90 -b:v 3500k -preset ultrafast -sc_threshold 0 -f flv rtmp://localhost/hls/$name_hi
        }

        application hls {
            live on;

            allow publish 127.0.0.1;
            deny publish all;

            hls on;
            hls_path /usr/local/nginx/html/hls;
            hls_fragment 6s;
            hls_playlist_length 18s;
            hls_nested on;
            # hls_fragment_slicing aligned;
            # hls_cleanup off;

            hls_variant _low BANDWIDTH=1100000;
            hls_variant _hi BANDWIDTH=3700000;
        }
    }
}
```

Nginx-HTTP
```
location /stat {
    rtmp_stat all;
    
    # Allow only localhost access
    # Change according to the web-server address
    allow 127.0.0.1
    deny all;
}
# HLS stream location
location /hls {
    types {
        application/vnd.apple.mpegurl m3u8;
        video/mp2t ts;
    }
    add_header Cache-Control no-cache;
    # To avoid issues with cross-domain HTTP requests (e.g. during development)
    add_header Access-Control-Allow-Origin *;
}
```
