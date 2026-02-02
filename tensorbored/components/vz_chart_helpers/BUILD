load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "vz_chart_helpers",
    srcs = [
        "plottable-interactions.ts",
        "vz-chart-helpers.ts",
        "vz-chart-tooltip.ts",
    ],
    strict_checks = False,
    deps = [
        "//tensorbored/components/polymer:legacy_element_mixin",
        "//tensorbored/components/vz_line_chart2:vz_line_chart2_scales",
        "@npm//@polymer/decorators",
        "@npm//@polymer/polymer",
        "@npm//@types/d3",
        "@npm//@types/lodash",
        "@npm//d3",
        "@npm//lodash",
        "@npm//plottable",
    ],
)
