load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "tf_graph_controls",
    srcs = [
        "tf-graph-controls.ts",
    ],
    strict_checks = False,
    deps = [
        "//tensorbored/components/polymer:dark_mode_mixin",
        "//tensorbored/components/polymer:irons_and_papers",
        "//tensorbored/components/polymer:legacy_element_mixin",
        "//tensorbored/components/tb_debug",
        "//tensorbored/components/tf_dashboard_common",
        "//tensorbored/plugins/graph/tf_graph_common",
        "//tensorbored/plugins/graph/tf_graph_node_search",
        "@npm//@polymer/decorators",
        "@npm//@polymer/polymer",
        "@npm//@types/lodash",
        "@npm//lodash",
    ],
)
