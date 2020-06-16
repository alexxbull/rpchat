FROM envoyproxy/envoy-alpine:v1.14.1
COPY ./docker/envoy.yaml ./cert.pem ./key.pem /etc/envoy/
CMD /usr/local/bin/envoy -c /etc/envoy/envoy.yaml