load("//tensorbored/defs:protos.bzl", "tb_proto_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

filegroup(
    name = "proto_srcs",
    srcs = glob(["*.proto"]),
)

tb_proto_library(
    name = "protos_all",
    srcs = [
        "data_provider.proto",
    ],
    has_services = True,
    deps = ["//tensorbored/compat/proto:protos_all"],
)
