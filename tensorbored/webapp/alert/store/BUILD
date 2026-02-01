load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

tf_ts_library(
    name = "store",
    srcs = [
        "alert_reducers.ts",
        "alert_selectors.ts",
        "index.ts",
    ],
    deps = [
        ":types",
        "//tensorbored/webapp/alert:types",
        "//tensorbored/webapp/alert/actions",
        "@npm//@ngrx/store",
    ],
)

tf_ts_library(
    name = "types",
    srcs = [
        "alert_types.ts",
    ],
    deps = [
        "//tensorbored/webapp/alert:types",
    ],
)

tf_ts_library(
    name = "testing",
    testonly = True,
    srcs = ["testing.ts"],
    deps = [
        ":types",
    ],
)

tf_ts_library(
    name = "test_lib",
    testonly = True,
    srcs = [
        "alert_reducers_test.ts",
        "alert_selectors_test.ts",
    ],
    deps = [
        ":store",
        ":testing",
        ":types",
        "//tensorbored/webapp/alert/actions",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
    ],
)
