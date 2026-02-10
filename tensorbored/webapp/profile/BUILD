load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ng_web_test_suite", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "types",
    srcs = [
        "types.ts",
    ],
    deps = [
        "//tensorbored/webapp/metrics:types",
        "//tensorbored/webapp/runs:types",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:internal_types",
    ],
)

tf_ng_module(
    name = "profile",
    srcs = [
        "index.ts",
        "profile_module.ts",
    ],
    deps = [
        ":types",
        "//tensorbored/webapp/profile/actions",
        "//tensorbored/webapp/profile/data_source",
        "//tensorbored/webapp/profile/effects",
        "//tensorbored/webapp/profile/store",
        "@npm//@angular/core",
        "@npm//@ngrx/effects",
        "@npm//@ngrx/store",
    ],
)

tf_ng_web_test_suite(
    name = "types_test",
    deps = [
        ":types_test_lib",
    ],
)

tf_ts_library(
    name = "types_test_lib",
    testonly = True,
    srcs = [
        "types_test.ts",
    ],
    deps = [
        ":types",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:internal_types",
        "@npm//@types/jasmine",
    ],
)
