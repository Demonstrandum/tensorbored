load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "lang",
    srcs = [
        "lang.ts",
    ],
)

tf_ts_library(
    name = "string",
    srcs = [
        "string.ts",
    ],
)

tf_ts_library(
    name = "types",
    srcs = [
        "types.ts",
    ],
)

tf_ts_library(
    name = "ngrx",
    srcs = [
        "ngrx.ts",
    ],
    deps = ["@npm//@ngrx/store"],
)

tf_ts_library(
    name = "value_formatter",
    srcs = [
        "value_formatter.ts",
    ],
)

tf_ts_library(
    name = "colors",
    srcs = [
        "colors.ts",
    ],
)

tf_ts_library(
    name = "oklch_colors",
    srcs = [
        "oklch_colors.ts",
    ],
)

tf_ts_library(
    name = "dom",
    srcs = [
        "dom.ts",
    ],
)

tf_ts_library(
    name = "matcher",
    srcs = [
        "matcher.ts",
    ],
    deps = [
        "//tensorbored/webapp/experiments:types",
        "//tensorbored/webapp/runs:types",
    ],
)

tf_ts_library(
    name = "memoize",
    srcs = [
        "memoize.ts",
    ],
)

tf_ts_library(
    name = "ui_selectors",
    srcs = [
        "ui_selectors.ts",
    ],
    deps = [
        ":colors",
        ":matcher",
        ":oklch_colors",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp/app_routing:types",
        "//tensorbored/webapp/app_routing/store",
        "//tensorbored/webapp/experiments/store:selectors",
        "//tensorbored/webapp/feature_flag/store",
        "//tensorbored/webapp/runs:types",
        "//tensorbored/webapp/runs/store:selectors",
        "//tensorbored/webapp/runs/store:types",
        "//tensorbored/webapp/settings",
        "@npm//@ngrx/store",
    ],
)

tf_ts_library(
    name = "util_tests",
    testonly = True,
    srcs = [
        "dom_test.ts",
        "lang_test.ts",
        "matcher_test.ts",
        "memoize_test.ts",
        "ngrx_test.ts",
        "string_test.ts",
        "ui_selectors_test.ts",
        "value_formatter_test.ts",
    ],
    deps = [
        ":colors",
        ":dom",
        ":lang",
        ":matcher",
        ":memoize",
        ":ngrx",
        ":string",
        ":ui_selectors",
        ":value_formatter",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp:selectors",
        "//tensorbored/webapp/app_routing:testing",
        "//tensorbored/webapp/app_routing:types",
        "//tensorbored/webapp/app_routing/store:testing",
        "//tensorbored/webapp/experiments/store:testing",
        "//tensorbored/webapp/feature_flag/store:testing",
        "//tensorbored/webapp/runs/store:testing",
        "//tensorbored/webapp/settings:testing",
        "//tensorbored/webapp/testing:utils",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
    ],
)
