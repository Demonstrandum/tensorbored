load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = [
    "//tensorbored/webapp/widgets/line_chart_v2/lib:__subpackages__",
])

tf_ts_library(
    name = "renderer",
    srcs = [
        "index.ts",
        "svg_renderer.ts",
        "threejs_renderer.ts",
    ],
    deps = [
        ":types",
        "//tensorbored/webapp/third_party:d3",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:coordinator",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:internal_types",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:utils",
        "@npm//@types/offscreencanvas",
        "@npm//@types/three",
        "@npm//three",
    ],
)

tf_ts_library(
    name = "types",
    srcs = [
        "renderer_types.ts",
    ],
    deps = [
        "//tensorbored/webapp/widgets/line_chart_v2/lib:internal_types",
    ],
)

tf_ts_library(
    name = "renderer_test",
    testonly = True,
    srcs = [
        "renderer_test.ts",
    ],
    visibility = [
        "//tensorbored:internal",
    ],
    deps = [
        ":renderer",
        ":types",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:coordinator",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:internal_types",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:testing",
        "@npm//@types/jasmine",
        "@npm//@types/three",
        "@npm//three",
    ],
)
