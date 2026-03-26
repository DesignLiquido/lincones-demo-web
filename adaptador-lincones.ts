import { Lexador, AvaliadorSintatico, TradutorSqlAnsi } from '@designliquido/lincones-js';

(window as any).lexador = new Lexador();
(window as any).avaliadorSintatico = new AvaliadorSintatico();
(window as any).tradutorSqlAnsi = new TradutorSqlAnsi();
