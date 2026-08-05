import { untrack, type Accessor } from 'solid-js';

import { dnsConfigState, setDnsConfig } from 'panel/stores/dnsConfig';
import intl from 'panel/common/intl';
import { ConfigDialog } from 'panel/common/ui/ConfigDialog';
import { Textarea } from 'panel/common/controls/Textarea';
import { validateCidrPerLine } from 'panel/helpers/validators';
import { useField } from 'panel/hooks/useField';
import theme from 'panel/lib/theme';

type Props = {
    open: Accessor<boolean>;
    onClose: () => void;
    processing: boolean;
};

export const TrustedProxiesDialog = (props: Props) => {
    const field = useField<string>(
        () => props.open(),
        () => dnsConfigState.trusted_proxies,
        {
            validate: (v) => (v ? validateCidrPerLine(v) || '' : ''),
        },
    );

    return (
        <ConfigDialog
            open={props.open()}
            title={intl.getMessage('dns_ppv2_trusted_proxies')}
            description={intl.getMessage('dns_ppv2_trusted_proxies_desc')}
            onClose={props.onClose}
            onSubmit={() => {
                field.submitIfValid((v) => {
                    setDnsConfig({ trusted_proxies: v });
                    untrack(() => props.onClose());
                });
            }}
            processing={props.processing}
        >
            <div class={theme.form.input}>
                <Textarea
                    value={field.value()}
                    onChange={(e: Event) => field.setValue((e.target as HTMLTextAreaElement).value)}
                    onBlur={() => field.validate()}
                    id="trusted_proxies"
                    label={intl.getMessage('dns_ppv2_trusted_proxies')}
                    placeholder="127.0.0.0/8"
                    size="medium"
                    errorMessage={field.error()}
                />
            </div>
        </ConfigDialog>
    );
};
