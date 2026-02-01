load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "tf_graph_loader",
    srcs = [
        "tf-graph-loader.ts",
    ],
    strict_checks = False,
    deps = [
        "//tensorbored/components/polymer:legacy_element_mixin",
        "//tensorbored/plugins/graph/tf_graph_common",
        "@npm//@polymer/decorators",
        "@npm//@polymer/polymer",
    ],
)

tf_ts_library(
    name = "tf_graph_dashboard_loader",
    srcs = [
        "tf-graph-dashboard-loader.ts",
    ],
    strict_checks = False,
    visibility = ["//visibility:public"],
    deps = [
        "//tensorbored/components/polymer:legacy_element_mixin",
        "//tensorbored/components/tf_backend",
        "//tensorbored/plugins/graph/tf_graph_common",
        "//tensorbored/plugins/graph/tf_graph_controls",
        "@npm//@polymer/decorators",
        "@npm//@polymer/polymer",
    ],
)
