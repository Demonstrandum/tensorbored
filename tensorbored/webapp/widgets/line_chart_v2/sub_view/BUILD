load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_sass_binary", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

tf_sass_binary(
    name = "line_chart_axis_view_styles",
    src = "line_chart_axis_view.scss",
    deps = [
        "//tensorbored/webapp:angular_material_sass_deps",
        "//tensorbored/webapp/theme",
    ],
)

tf_sass_binary(
    name = "line_chart_interactive_view_styles",
    src = "line_chart_interactive_view.scss",
)

tf_ng_module(
    name = "sub_view",
    srcs = [
        "chart_view_utils.ts",
        "line_chart_axis_utils.ts",
        "line_chart_axis_view.ts",
        "line_chart_grid_view.ts",
        "line_chart_interactive_utils.ts",
        "line_chart_interactive_view.ts",
        "sub_view_module.ts",
    ],
    assets = [
        ":line_chart_axis_view_styles",
        ":line_chart_interactive_view_styles",
        "line_chart_axis_view.ng.html",
        "line_chart_interactive_view.ng.html",
    ],
    deps = [
        ":internal_types",
        "//tensorbored/webapp/angular:expect_angular_cdk_overlay",
        "//tensorbored/webapp/angular:expect_angular_material_button",
        "//tensorbored/webapp/angular:expect_angular_material_icon",
        "//tensorbored/webapp/angular:expect_angular_material_input",
        "//tensorbored/webapp/angular:expect_angular_material_menu",
        "//tensorbored/webapp/third_party:d3",
        "//tensorbored/webapp/util:dom",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:public_types",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:scale",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//rxjs",
    ],
)

tf_ts_library(
    name = "internal_types",
    srcs = ["internal_types.ts"],
    visibility = ["//visibility:private"],
)

tf_ts_library(
    name = "sub_view_tests",
    testonly = True,
    srcs = [
        "line_chart_axis_utils_test.ts",
        "line_chart_axis_view_test.ts",
        "line_chart_grid_view_test.ts",
        "line_chart_interactive_utils_test.ts",
        "line_chart_interactive_view_test.ts",
        "testing.ts",
    ],
    deps = [
        ":internal_types",
        ":sub_view",
        "//tensorbored/webapp/angular:expect_angular_cdk_overlay",
        "//tensorbored/webapp/angular:expect_angular_cdk_testing_testbed",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_angular_material_button",
        "//tensorbored/webapp/angular:expect_angular_material_input",
        "//tensorbored/webapp/angular:expect_angular_material_menu",
        "//tensorbored/webapp/angular:expect_angular_material_menu_testing",
        "//tensorbored/webapp/angular:expect_angular_platform_browser_animations",
        "//tensorbored/webapp/testing:mat_icon",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:public_types",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:scale",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:testing",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@angular/platform-browser",
        "@npm//@types/jasmine",
    ],
)
