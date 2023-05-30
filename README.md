# LZSS-in-js
A implementaion of the LZSS compression algorithm in Javascript

* Note this may not be 100% accurate to the actual algorithm
*   Don't recommend using it in on a professional level
*   Its also slow ;-;

Usage Specifications
*   compress is used to compress a string and output a array of BITS not bytes
*   decompress takes an array of BITS, no bytes, and outputs a string
*   b_buffer (LZSS.b_buffer) is the length of the Search Buffer (default is 32kb)
*   look_ahead (LZSS.look_ahead) is the length of the look ahead buffer (default is 256b)
*   Compression ratio is ~77%
*   Recommended to have a smaller buffer for smaller amounts of text
