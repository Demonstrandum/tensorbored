load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "tf_graph_node_search",
    srcs = ["tf-graph-node-search.ts"],
    strict_checks = False,
    visibility = ["//visibility:public"],
    deps = [
        "//tensorbored/components/polymer:irons_and_papers",
        "//tensorbored/components/polymer:legacy_element_mixin",
        "//tensorbored/components/tb_debug",
        "//tensorbored/components/tf_dashboard_common",
        "//tensorbored/plugins/graph/tf_graph_common",
        "@npm//@polymer/decorators",
        "@npm//@polymer/polymer",
        "@npm//@types/lodash",
        "@npm//lodash",
    ],
)
