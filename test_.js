function bar(x) {
    yield [
        VM.break,
        23,
        32
    ];
    yield [
        VM.return,
        (yield [
            function () {
                yield [
                    VM.giveback,
                    (yield [
                        function () {
                            yield [
                                VM.giveback,
                                (yield [
                                    function () {
                                        yield [
                                            VM.giveback,
                                            foo
                                        ];
                                    },
                                    44,
                                    47
                                ])((yield [
                                    function () {
                                        yield [
                                            VM.giveback,
                                            (yield [
                                                function () {
                                                    yield [
                                                        VM.giveback,
                                                        x
                                                    ];
                                                },
                                                48,
                                                49
                                            ]) - (yield [
                                                function () {
                                                    yield [
                                                        VM.giveback,
                                                        1
                                                    ];
                                                },
                                                52,
                                                53
                                            ])
                                        ];
                                    },
                                    48,
                                    53
                                ]))
                            ];
                        },
                        44,
                        54
                    ]) + (yield [
                        function () {
                            yield [
                                VM.giveback,
                                1
                            ];
                        },
                        57,
                        58
                    ])
                ];
            },
            44,
            58
        ]),
        37,
        59
    ];
}
function foo(x) {
    if (yield [
            function () {
                yield [
                    VM.giveback,
                    (yield [
                        function () {
                            yield [
                                VM.giveback,
                                x
                            ];
                        },
                        88,
                        89
                    ]) > (yield [
                        function () {
                            yield [
                                VM.giveback,
                                0
                            ];
                        },
                        92,
                        93
                    ])
                ];
            },
            88,
            93
        ]) {
        yield [
            VM.return,
            (yield [
                function () {
                    yield [
                        VM.giveback,
                        (yield [
                            function () {
                                yield [
                                    VM.giveback,
                                    3
                                ];
                            },
                            112,
                            113
                        ]) + (yield [
                            function () {
                                yield [
                                    VM.giveback,
                                    (yield [
                                        function () {
                                            yield [
                                                VM.giveback,
                                                bar
                                            ];
                                        },
                                        116,
                                        119
                                    ])((yield [
                                        function () {
                                            yield [
                                                VM.giveback,
                                                x
                                            ];
                                        },
                                        120,
                                        121
                                    ]))
                                ];
                            },
                            116,
                            122
                        ])
                    ];
                },
                112,
                122
            ]),
            105,
            123
        ];
    }
    yield [
        VM.return,
        (yield [
            function () {
                yield [
                    VM.giveback,
                    0
                ];
            },
            141,
            142
        ]),
        134,
        143
    ];
}
TEST = {
    bar: bar,
    foo: foo,
    _src: '\nfunction bar(x) {\n    debugger;\n    return foo(x - 1) + 1;\n}\n\nfunction foo(x) {\n    if(x > 0) {\n        return 3 + bar(x);\n    }\n    return 0;\n}\n\n'
};
