load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_sass_binary", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_sass_binary(
    name = "line_chart_styles",
    src = "line_chart_component.scss",
    deps = ["//tensorbored/webapp/theme"],
)

tf_ng_module(
    name = "line_chart_v2",
    srcs = [
        "line_chart_component.ts",
        "line_chart_module.ts",
        "types.ts",
    ],
    assets = [
        "line_chart_component.ng.html",
        ":line_chart_styles",
    ],
    deps = [
        ":internal_utils",
        "//tensorbored/webapp/angular:expect_angular_cdk_overlay",
        "//tensorbored/webapp/widgets:resize_detector",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:chart",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:chart_types",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:public_types",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:scale",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:utils",
        "//tensorbored/webapp/widgets/line_chart_v2/lib/worker:worker_chart",
        "//tensorbored/webapp/widgets/line_chart_v2/sub_view",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//rxjs",
    ],
)

tf_ts_library(
    name = "internal_utils",
    srcs = [
        "line_chart_internal_utils.ts",
    ],
    visibility = ["//visibility:private"],
    deps = [
        "//tensorbored/webapp/third_party:d3",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:public_types",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:utils",
    ],
)

tf_ts_library(
    name = "line_chart_utils",
    srcs = [
        "data_transformer.ts",
    ],
    deps = [
        "//tensorbored/webapp/widgets/line_chart_v2/lib:public_types",
    ],
)

tf_ts_library(
    name = "line_chart_v2_tests",
    testonly = True,
    srcs = [
        "data_transformer_test.ts",
        "line_chart_component_test.ts",
        "line_chart_internal_utils_test.ts",
    ],
    deps = [
        ":internal_utils",
        ":line_chart_utils",
        ":line_chart_v2",
        "//tensorbored/webapp/angular:expect_angular_cdk_overlay",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:chart",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:public_types",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:scale",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:testing",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:utils",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@angular/platform-browser",
        "@npm//@types/jasmine",
    ],
)
