load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "tf_graph_dashboard",
    srcs = ["tf-graph-dashboard.ts"],
    strict_checks = False,
    deps = [
        "//tensorbored/components/polymer:irons_and_papers",
        "//tensorbored/components/polymer:legacy_element_mixin",
        "//tensorbored/components/tf_backend",
        "//tensorbored/components/tf_dashboard_common",
        "//tensorbored/components/tf_storage",
        "//tensorbored/components/vz_sorting",
        "//tensorbored/plugins/graph/tf_graph",
        "//tensorbored/plugins/graph/tf_graph_board",
        "//tensorbored/plugins/graph/tf_graph_common",
        "//tensorbored/plugins/graph/tf_graph_controls",
        "//tensorbored/plugins/graph/tf_graph_loader:tf_graph_dashboard_loader",
        "@npm//@polymer/decorators",
        "@npm//@polymer/polymer",
    ],
)
