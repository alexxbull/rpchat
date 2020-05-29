FROM envoyproxy/envoy-alpine:v1.14.1
COPY ./docker/envoy.yaml /etc/envoy/envoy.yaml
CMD /usr/local/bin/envoy -c /etc/envoy/envoy.yaml