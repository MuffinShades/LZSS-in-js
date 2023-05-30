/*
Written by muffinshades (Twitter) or MuffinShades (Github)
*/
let LZSS = {
    look_ahead: 256,
    b_buffer: 2**15,

            //number of bytes to store the size of either buffer
            BUFFER_BYTE_LEN: 2,

            compress: function(dat) {
                let d = dat;

                let idx = 0;

                let look_ahead_buffer = '';
                let search_buffer = '';

                let output = [];

                let get_char_bits = function(a) {
                    let r = [];
                    let v = a.charCodeAt(0);
                    for (let i = 0; i < 8; i++) {
                        r[i] = ((1 << i) & v) >> i;
                    }
                    return r;
                }

                let char_collect_test = '';

                let output_size = 0;

                while (idx < d.length) {
                    let c = d[idx];

                    if (search_buffer.indexOf(c) >= 0) {
                        //output.push(1);

                        let l = 0;

                        let _idx = search_buffer.indexOf(c);
                        let last_idx = search_buffer.indexOf(c);

                        let Chars = c;

                        while (_idx >= 0 && l < look_ahead) {
                            if (!d[idx+l]) break;
                            l++;
                            last_idx = _idx;
                            Chars += d[idx+l] || '';
                            _idx = search_buffer.indexOf(Chars);
                        }
                        if (l*8 > 1+Math.log2(b_buffer)+Math.log2(look_ahead)) {
                            char_collect_test += `<${last_idx},${l}>`;
                            idx += (l);

                            if (l <= 1) {
                                idx++;
                            }

                            output_size += 1+Math.log2(b_buffer)+Math.log2(look_ahead);
                            output.push(1);
                            let c = 1;
                            for (let i = Math.log2(b_buffer)-1; i >= 0; i--) {
                                output.push(((1 << i) & last_idx) >> i);
                                c++;
                            }
                            for (let i = Math.log2(look_ahead)-1; i >= 0; i--) {
                                output.push(((1 << i) & l) >> i);
                                c++;
                            }
                        } else {
                            let b = get_char_bits(c);
                            search_buffer += c;

                            char_collect_test += c;

                            if (search_buffer >= b_buffer) {
                                search_buffer = search_buffer.substring(1);
                            }
                            output.push(0);
                            for (let  i = 7; i >= 0; i--) {
                                 output.push(b[i] || 0);
                            }

                            idx++;
                            output_size += 9;
                        }
                    } else {
                        let b = get_char_bits(c);
                        search_buffer += c;

                        char_collect_test += c;

                        if (search_buffer >= b_buffer) {
                            search_buffer = search_buffer.substring(1);
                        }
                        output.push(0);
                        for (let  i = 7; i >= 0; i--) {
                            output.push(b[i] || 0);
                        }

                        idx++;
                        output_size += 9;
                    }
                }
                //add sliding window lengths
                for (let i = 0; i < 8*BUFFER_BYTE_LEN; i++) {
                    output.unshift(((look_ahead >> i) & 0x00000001));
                }
                for (let i = 0; i < 8*BUFFER_BYTE_LEN; i++) {
                    output.unshift(((b_buffer >> i) & 0x000000001));
                }

                let r = '';
                let i = 0;
                while(i < output.length) {
                    let b = 0;
                    for (let j =0; j < 8; j++) {
                        b = ((b << 1) + output[i+j]);
                        i++;
                    }
                    r += String.fromCharCode(b);
                }
                for (let i = 8*BUFFER_BYTE_LEN*2; i < output.length; i++) {
                    for (let j = 0; j < 8; j++) {
                        i++;
                    }
                }
                return output;
            },

            decompress: function(_bits) {
                //let bits = [];

                let b_buf=0,f_buf=0;

                let s_buf = '';

                for (let i = 0; i < BUFFER_BYTE_LEN*8; i++) {
                    b_buf = ((b_buf << 0x000000001) | _bits[i]);
                }
                for (let i = 0; i < BUFFER_BYTE_LEN*8; i++) {
                    f_buf = ((f_buf << 0x000000001) | _bits[i+BUFFER_BYTE_LEN*8]);
                }

                let bits = [];

                for (let i = BUFFER_BYTE_LEN*2*8; i < _bits.length; i++){ 
                    bits.push(_bits[i]);
                }

                let r = '';

                let i = 0; 
                while (i < bits.length) {
                    if (bits[i] == 0) {
                        i++;
                        let b = 0;
                        for (let j = 0; j < 8; j++) {
                            b = (b << 1) | bits[i];
                            i++;
                        }
                        let c = String.fromCharCode(b);
                        r += c;
                        s_buf += c;
                    } else if (bits[i] == 1) {
                        i++;
                        //l_b is length of back buffer and l_f is length of front buffer
                        let l_b = Math.log2(b_buf), l_f = Math.log2(f_buf);

                        let back_ref = 0;
                        let col = '';
                        for (let j = 0; j < l_b; j++) {
                            
                            back_ref = (back_ref << 1) | bits[i];
                            col += (bits[i] || 0).toString();
                            i++;
                        }
                        let len = 0;
                        col = '';
                        for (let j = 0; j < l_f; j++) {
                            len = (len << 1) | bits[i];
                            col += (bits[i] || 0).toString();
                            i++;
                        }
                        let _dat = '';

                        for (let j = back_ref; j < back_ref+len; j++) {
                            _dat += s_buf[j];
                        }

                        r += _dat;
                    }
                }

                return r;
            }
        }
