'use strict';

window.addEventListener('load', function () {
    new Vue({
        el: '#forms',
        data: {
            options: [...Array(5).keys()].map(i => {
                return {key: i, value: `option ${i}`};
            }),
            username: 'hello',
            password: '',
            toggle: false,
            check: true,
            radio: 'B',
            select: '',
            date: '',
            datetime: '',
            textarea: 'hello\nworld'
        },
        methods: {
        }
    });
});