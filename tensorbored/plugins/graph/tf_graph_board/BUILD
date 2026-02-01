load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "tf_graph_board",
    srcs = ["tf-graph-board.ts"],
    strict_checks = False,
    visibility = ["//visibility:public"],
    deps = [
        "//tensorbored/components/polymer:irons_and_papers",
        "//tensorbored/components/polymer:legacy_element_mixin",
        "//tensorbored/plugins/graph/tf_graph",
        "//tensorbored/plugins/graph/tf_graph_common",
        "//tensorbored/plugins/graph/tf_graph_info",
        "@npm//@polymer/decorators",
        "@npm//@polymer/polymer",
    ],
)
