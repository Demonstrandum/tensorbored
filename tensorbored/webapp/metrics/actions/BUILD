load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "actions",
    srcs = [
        "index.ts",
    ],
    deps = [
        "//tensorbored/webapp/metrics:types",
        "//tensorbored/webapp/metrics/data_source",
        "//tensorbored/webapp/metrics/store:types",
        "//tensorbored/webapp/util:dom",
        "//tensorbored/webapp/widgets/card_fob:types",
        "//tensorbored/webapp/widgets/data_table:types",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:internal_types",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:public_types",
        "@npm//@ngrx/store",
    ],
)
