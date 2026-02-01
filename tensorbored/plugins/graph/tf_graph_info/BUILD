load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "tf_graph_info",
    srcs = [
        "tf-graph-info.ts",
        "tf-node-info.ts",
        "tf-node-list-item.ts",
    ],
    strict_checks = False,
    deps = [
        "//tensorbored/components/polymer:dark_mode_mixin",
        "//tensorbored/components/polymer:dom",
        "//tensorbored/components/polymer:irons_and_papers",
        "//tensorbored/components/polymer:legacy_element_mixin",
        "//tensorbored/components/tf_dashboard_common",
        "//tensorbored/components/tf_wbr_string",
        "//tensorbored/plugins/graph/tf_graph_common",
        "//tensorbored/plugins/graph/tf_graph_debugger_data_card",
        "//tensorbored/plugins/graph/tf_graph_op_compat_card",
        "@npm//@polymer/decorators",
        "@npm//@polymer/polymer",
        "@npm//@types/lodash",
        "@npm//lodash",
    ],
)
