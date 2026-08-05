import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
    dnsInfo: vi.fn(),
    dnsConfig: vi.fn(),
    cacheClear: vi.fn(),
    addErrorToast: vi.fn(),
    addSuccessToast: vi.fn(),
}));

vi.mock('panel/api/generated', () => ({
    dnsInfo: mocks.dnsInfo,
    dnsConfig: mocks.dnsConfig,
    cacheClear: mocks.cacheClear,
}));
vi.mock('panel/stores/toasts', () => ({
    addErrorToast: mocks.addErrorToast,
    addSuccessToast: mocks.addSuccessToast,
}));
vi.mock('panel/common/intl', () => ({
    default: { getMessage: vi.fn((key: string) => key) },
}));

import {
    getDnsConfig,
    setDnsConfig,
    dnsConfigState,
    toggleResolveClients,
    toggleTcpProxyProtocolV2,
    toggleTlsProxyProtocolV2,
} from 'panel/stores/dnsConfig';

describe('getDnsConfig', () => {
    beforeEach(() => vi.clearAllMocks());

    it('defaults null blocking IPs and empty upstream_mode', async () => {
        mocks.dnsInfo.mockResolvedValue({
            blocking_ipv4: null,
            blocking_ipv6: null,
            upstream_mode: '',
        });
        await getDnsConfig();
        expect(dnsConfigState.blocking_ipv4).toBe('0.0.0.0');
        expect(dnsConfigState.blocking_ipv6).toBe('::');
        expect(dnsConfigState.upstream_mode).toBe('load_balance');
    });

    it('joins trusted_proxies and maps PPv2 toggles', async () => {
        mocks.dnsInfo.mockResolvedValue({
            trusted_proxies: ['10.0.0.0/8', '::1/128'],
            tcp_proxy_protocol_v2_enabled: true,
            tls_proxy_protocol_v2_enabled: false,
        });
        await getDnsConfig();
        expect(dnsConfigState.trusted_proxies).toBe('10.0.0.0/8\n::1/128');
        expect(dnsConfigState.tcp_proxy_protocol_v2_enabled).toBe(true);
        expect(dnsConfigState.tls_proxy_protocol_v2_enabled).toBe(false);
    });
});

describe('setDnsConfig trusted_proxies', () => {
    beforeEach(() => vi.clearAllMocks());

    it('splits trusted_proxies string into an array for the API', async () => {
        mocks.dnsConfig.mockResolvedValue({});
        await setDnsConfig({ trusted_proxies: '10.0.0.0/8\n' });
        expect(mocks.dnsConfig).toHaveBeenCalledWith(
            expect.objectContaining({
                trusted_proxies: ['10.0.0.0/8'],
            }),
        );
    });
});

describe('toggleResolveClients', () => {
    beforeEach(() => vi.clearAllMocks());

    it('toggles resolve_clients and persists', async () => {
        mocks.dnsConfig.mockResolvedValue({});

        const before = dnsConfigState.resolve_clients;
        await toggleResolveClients();
        expect(dnsConfigState.resolve_clients).toBe(!before);

        // Toggle back
        await toggleResolveClients();
        expect(dnsConfigState.resolve_clients).toBe(before);
    });

    it('calls dnsConfig with inverted value', async () => {
        mocks.dnsConfig.mockResolvedValue({});

        const before = dnsConfigState.resolve_clients;
        await toggleResolveClients();
        expect(mocks.dnsConfig).toHaveBeenCalledWith({
            resolve_clients: !before,
        });
    });
});

describe('PPv2 toggles', () => {
    beforeEach(() => vi.clearAllMocks());

    it('toggleTcpProxyProtocolV2 posts inverted boolean', async () => {
        mocks.dnsConfig.mockResolvedValue({});
        const before = dnsConfigState.tcp_proxy_protocol_v2_enabled;
        await toggleTcpProxyProtocolV2();
        expect(mocks.dnsConfig).toHaveBeenCalledWith({
            tcp_proxy_protocol_v2_enabled: !before,
        });
        expect(mocks.addSuccessToast).not.toHaveBeenCalled();
    });

    it('toggleTlsProxyProtocolV2 posts inverted boolean', async () => {
        mocks.dnsConfig.mockResolvedValue({});
        const before = dnsConfigState.tls_proxy_protocol_v2_enabled;
        await toggleTlsProxyProtocolV2();
        expect(mocks.dnsConfig).toHaveBeenCalledWith({
            tls_proxy_protocol_v2_enabled: !before,
        });
        expect(mocks.addSuccessToast).not.toHaveBeenCalled();
    });
});
