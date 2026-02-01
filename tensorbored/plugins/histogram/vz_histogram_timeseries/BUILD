load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "vz_histogram_timeseries",
    srcs = ["vz-histogram-timeseries.ts"],
    strict_checks = False,
    deps = [
        "//tensorbored/components/polymer:dark_mode_mixin",
        "//tensorbored/components/polymer:legacy_element_mixin",
        "@npm//@polymer/decorators",
        "@npm//@polymer/polymer",
        "@npm//@types/d3",
        "@npm//d3",
    ],
)
