load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "store",
    srcs = [
        "app_routing_reducers.ts",
        "app_routing_selectors.ts",
    ],
    deps = [
        ":types",
        "//tensorbored/webapp/app_routing:internal_utils",
        "//tensorbored/webapp/app_routing:store_only_utils",
        "//tensorbored/webapp/app_routing:types",
        "//tensorbored/webapp/app_routing/actions",
        "//tensorbored/webapp/experiments:types",
        "@npm//@ngrx/store",
    ],
)

tf_ts_library(
    name = "types",
    srcs = [
        "app_routing_types.ts",
    ],
    deps = [
        "//tensorbored/webapp/app_routing:types",
    ],
)

tf_ts_library(
    name = "testing",
    testonly = True,
    srcs = [
        "testing.ts",
    ],
    deps = [
        ":store",
        ":types",
    ],
)

tf_ts_library(
    name = "store_test_lib",
    testonly = True,
    srcs = [
        "app_routing_reducers_test.ts",
        "app_routing_selectors_test.ts",
    ],
    deps = [
        ":store",
        ":testing",
        "//tensorbored/webapp/app_routing:testing",
        "//tensorbored/webapp/app_routing:types",
        "//tensorbored/webapp/app_routing/actions",
        "@npm//@types/jasmine",
    ],
)
