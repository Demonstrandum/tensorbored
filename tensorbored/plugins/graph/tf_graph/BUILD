load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "tf_graph",
    srcs = [
        "tf-graph.ts",
        "tf-graph-minimap.ts",
        "tf-graph-scene.html.ts",
        "tf-graph-scene.ts",
    ],
    strict_checks = False,
    deps = [
        "//tensorbored/components/polymer:dark_mode_mixin",
        "//tensorbored/components/polymer:irons_and_papers",
        "//tensorbored/components/polymer:legacy_element_mixin",
        "//tensorbored/components/tb_debug",
        "//tensorbored/components/tf_dashboard_common",
        "//tensorbored/plugins/graph/tf_graph_common",
        "@npm//@polymer/decorators",
        "@npm//@polymer/polymer",
        "@npm//@types/d3",
        "@npm//@types/lodash",
        "@npm//d3",
        "@npm//lodash",
    ],
)
