/**
 * Testes de geocoding.js
 *
 * Diferente da versão anterior (que apenas simulava fetch sem
 * chamar nenhuma função real do projeto), estes testes importam
 * e exercitam diretamente as funções de normalização, validação
 * de nome de cidade e de coordenadas usadas pela aplicação.
 */

import {
    normalizarCidadeGeocoding,
    normalizarParaComparacaoGeocoding,
    validarCidadeGeocoding,
    localizacaoValidaGeocoding,
    criarChaveLocalizacaoGeocoding,
    expressaoCompativelComNomeGeocoding
} from '../assets/js/geocoding.js';

describe('geocoding.js', () => {

    describe('normalizarCidadeGeocoding', () => {

        test('remove espaços nas pontas e espaços duplicados no meio', () => {
            expect(
                normalizarCidadeGeocoding('   São   Paulo   ')
            ).toBe('São Paulo');
        });

        test('aplica normalização Unicode NFC', () => {
            // "e" + acento combinante (NFD) deve virar "é" (NFC)
            const comAcentoCombinante = 'Bogota\u0301';

            expect(
                normalizarCidadeGeocoding(comAcentoCombinante)
            ).toBe('Bogotá');
        });

        test('entrada não-string retorna string vazia', () => {
            expect(normalizarCidadeGeocoding(null)).toBe('');
            expect(normalizarCidadeGeocoding(undefined)).toBe('');
            expect(normalizarCidadeGeocoding(123)).toBe('');
        });

    });


    describe('normalizarParaComparacaoGeocoding', () => {

        test('trata "São Paulo" e "Sao Paulo" como equivalentes', () => {
            expect(
                normalizarParaComparacaoGeocoding('São Paulo')
            ).toBe(
                normalizarParaComparacaoGeocoding('Sao Paulo')
            );
        });

    });


    describe('validarCidadeGeocoding', () => {

        test('rejeita pesquisa vazia', () => {
            const resultado = validarCidadeGeocoding('');

            expect(resultado.valida).toBe(false);
        });

        test('rejeita string apenas com espaços', () => {
            const resultado = validarCidadeGeocoding('    ');

            expect(resultado.valida).toBe(false);
        });

        test('rejeita nomes com mais de 100 caracteres', () => {
            const cidadeMuitoLonga = 'A'.repeat(101);

            const resultado = validarCidadeGeocoding(cidadeMuitoLonga);

            expect(resultado.valida).toBe(false);
        });

        test('aceita nome de exatamente 100 caracteres', () => {
            const cidadeNoLimite = 'A'.repeat(100);

            const resultado = validarCidadeGeocoding(cidadeNoLimite);

            expect(resultado.valida).toBe(true);
        });

        test.each([
            'São Paulo',
            'München',
            'Bogotá',
            'Zürich',
            "N'Djamena",
            'Rio de Janeiro',
            'Cidade do Cabo'
        ])('aceita nome de cidade válido: %s', (cidade) => {
            expect(validarCidadeGeocoding(cidade).valida).toBe(true);
        });

        test.each([
            'São Paulo<script>',
            'Cidade@#$',
            '<script>alert(1)</script>',
            '!!!???',
            '////'
        ])('rejeita entrada com caracteres inválidos: %s', (cidade) => {
            expect(validarCidadeGeocoding(cidade).valida).toBe(false);
        });

    });


    describe('expressaoCompativelComNomeGeocoding', () => {

        test('reconhece a mesma cidade escrita com/sem acento', () => {
            expect(
                expressaoCompativelComNomeGeocoding('sao paulo', 'São Paulo')
            ).toBe(true);
        });

        test('não confunde cidades com nomes diferentes', () => {
            expect(
                expressaoCompativelComNomeGeocoding('Tokyo', 'São Paulo')
            ).toBe(false);
        });

    });


    describe('localizacaoValidaGeocoding', () => {

        test('aceita coordenadas dentro dos limites válidos', () => {
            expect(
                localizacaoValidaGeocoding({
                    name: 'São Paulo',
                    latitude: -23.55,
                    longitude: -46.63
                })
            ).toBe(true);
        });

        test('rejeita objeto sem nome', () => {
            expect(
                localizacaoValidaGeocoding({
                    latitude: -23.55,
                    longitude: -46.63
                })
            ).toBe(false);
        });

        test('rejeita latitude/longitude não numéricas', () => {
            expect(
                localizacaoValidaGeocoding({
                    name: 'São Paulo',
                    latitude: 'norte',
                    longitude: -46.63
                })
            ).toBe(false);
        });

        test('rejeita entrada nula/indefinida', () => {
            expect(localizacaoValidaGeocoding(null)).toBe(false);
            expect(localizacaoValidaGeocoding(undefined)).toBe(false);
        });

    });


    describe('criarChaveLocalizacaoGeocoding (suporte a cidades homônimas)', () => {

        test('gera chaves diferentes para cidades homônimas em países distintos', () => {
            const saoPauloBrasil = {
                name: 'São Paulo',
                country: 'Brasil',
                latitude: -23.55,
                longitude: -46.63
            };

            const outraLocalizacaoHomonima = {
                name: 'São Paulo',
                country: 'Outro país',
                latitude: 40.0,
                longitude: -8.0
            };

            const chave1 = criarChaveLocalizacaoGeocoding(saoPauloBrasil);
            const chave2 = criarChaveLocalizacaoGeocoding(outraLocalizacaoHomonima);

            expect(chave1).not.toBe('');
            expect(chave2).not.toBe('');
            expect(chave1).not.toBe(chave2);
        });

        test('gera a mesma chave para a mesma cidade pesquisada de formas diferentes', () => {
            const base = {
                name: 'São Paulo',
                country: 'Brasil',
                latitude: -23.55,
                longitude: -46.63
            };

            const mesmaCidadeSemAcento = {
                name: 'Sao Paulo',
                country: 'Brasil',
                latitude: -23.55,
                longitude: -46.63
            };

            expect(
                criarChaveLocalizacaoGeocoding(base)
            ).toBe(
                criarChaveLocalizacaoGeocoding(mesmaCidadeSemAcento)
            );
        });

        test('retorna string vazia para localização inválida', () => {
            expect(
                criarChaveLocalizacaoGeocoding({ name: '', latitude: null, longitude: null })
            ).toBe('');
        });

    });

});
