import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ReferralStats {
  clicks: number;
  registrations: number;
  activeSubscriptions: number;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  monthlyEarnings: number;
  volumeBonus: boolean;
  volumeBonusPercentage: number;
  partnerStatus: boolean;
  whitelabel: boolean;
  referralCode: string;
}

interface Referral {
  id: string;
  name: string;
  email: string;
  plan: 'hobby' | 'pro' | 'business';
  joinedAt: string;
  status: 'active' | 'inactive';
  earnings: number;
  monthlyEarnings: number;
  stripeConnected: boolean;
  stripeAccountId?: string;
}

interface Resource {
  id: string;
  type: 'banner' | 'text' | 'video';
  title: string;
  url: string;
  preview?: string;
  isPremium?: boolean;
}

interface ReferralState {
  stats: ReferralStats;
  referrals: Referral[];
  resources: Resource[];
  requestPayout: () => Promise<void>;
  trackClick: () => Promise<void>;
  trackRegistration: (referralId: string) => Promise<void>;
  trackSubscription: (referralId: string, plan: string) => Promise<void>;
  connectStripe: (accountId: string) => Promise<void>;
  calculateCommission: (plan: string, amount: number) => number;
  checkVolumeBonus: () => Promise<void>;
  updatePartnerStatus: () => Promise<void>;
}

const COMMISSION_RATES = {
  hobby: 0,
  pro: 0.30, // 30% de $20 = $6
  business: 0.25 // 25% de $40 = $10
};

const VOLUME_BONUS_THRESHOLD = 10; // 10+ clientes activos
const VOLUME_BONUS_PERCENTAGE = 0.05; // +5%
const PARTNER_THRESHOLD = 500; // $500 en comisiones
const MINIMUM_PAYOUT = 50; // $50 mínimo para retiro

export const useReferralStore = create<ReferralState>()(
  persist(
    (set, get) => ({
      stats: {
        clicks: 0,
        registrations: 0,
        activeSubscriptions: 0,
        totalEarnings: 0,
        pendingEarnings: 0,
        paidEarnings: 0,
        monthlyEarnings: 0,
        volumeBonus: false,
        volumeBonusPercentage: 0,
        partnerStatus: false,
        whitelabel: false,
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase()
      },
      referrals: [],
      resources: [
        {
          id: '1',
          type: 'banner',
          title: 'Banner Principal',
          url: '/resources/banner-main.png',
          preview: '/resources/banner-main-preview.png'
        },
        {
          id: '2',
          type: 'text',
          title: 'Texto Promocional',
          url: '/resources/promo-text.txt'
        },
        {
          id: '3',
          type: 'video',
          title: 'Video Demo',
          url: '/resources/demo-video.mp4',
          preview: '/resources/demo-video-preview.png'
        },
        {
          id: '4',
          type: 'banner',
          title: 'Banner Premium',
          url: '/resources/banner-premium.png',
          preview: '/resources/banner-premium-preview.png',
          isPremium: true
        }
      ],
      requestPayout: async () => {
        try {
          const { stats } = get();
          if (stats.pendingEarnings < MINIMUM_PAYOUT) {
            throw new Error(`Monto mínimo para retiro: $${MINIMUM_PAYOUT}`);
          }
          // Aquí iría la llamada a la API para solicitar el pago
          set(state => ({
            stats: {
              ...state.stats,
              pendingEarnings: 0,
              paidEarnings: state.stats.paidEarnings + state.stats.pendingEarnings
            }
          }));
        } catch (error) {
          console.error('Error requesting payout:', error);
          throw error;
        }
      },
      trackClick: async () => {
        try {
          set(state => ({
            stats: {
              ...state.stats,
              clicks: state.stats.clicks + 1
            }
          }));
        } catch (error) {
          console.error('Error tracking click:', error);
          throw error;
        }
      },
      trackRegistration: async (referralId: string) => {
        try {
          set(state => ({
            stats: {
              ...state.stats,
              registrations: state.stats.registrations + 1
            },
            referrals: [
              ...state.referrals,
              {
                id: referralId,
                name: 'Nuevo Usuario',
                email: 'usuario@ejemplo.com',
                plan: 'hobby',
                joinedAt: new Date().toISOString(),
                status: 'active',
                earnings: 0,
                monthlyEarnings: 0,
                stripeConnected: false
              }
            ]
          }));
        } catch (error) {
          console.error('Error tracking registration:', error);
          throw error;
        }
      },
      trackSubscription: async (referralId: string, plan: string) => {
        try {
          const { calculateCommission, checkVolumeBonus } = get();
          const commission = calculateCommission(plan, plan === 'pro' ? 20 : 40);
          
          set(state => ({
            stats: {
              ...state.stats,
              activeSubscriptions: state.stats.activeSubscriptions + 1,
              pendingEarnings: state.stats.pendingEarnings + commission,
              monthlyEarnings: state.stats.monthlyEarnings + commission
            },
            referrals: state.referrals.map(r =>
              r.id === referralId
                ? {
                    ...r,
                    plan: plan as 'hobby' | 'pro' | 'business',
                    earnings: r.earnings + commission,
                    monthlyEarnings: r.monthlyEarnings + commission
                  }
                : r
            )
          }));

          await checkVolumeBonus();
        } catch (error) {
          console.error('Error tracking subscription:', error);
          throw error;
        }
      },
      connectStripe: async (accountId: string) => {
        try {
          set(state => ({
            referrals: state.referrals.map(r => ({
              ...r,
              stripeConnected: true,
              stripeAccountId: accountId
            }))
          }));
        } catch (error) {
          console.error('Error connecting Stripe:', error);
          throw error;
        }
      },
      calculateCommission: (plan: string, amount: number) => {
        const baseRate = COMMISSION_RATES[plan as keyof typeof COMMISSION_RATES] || 0;
        const { stats } = get();
        const volumeBonus = stats.volumeBonus ? VOLUME_BONUS_PERCENTAGE : 0;
        const totalRate = baseRate + volumeBonus;
        return amount * totalRate;
      },
      checkVolumeBonus: async () => {
        try {
          const { stats, referrals } = get();
          const activeReferrals = referrals.filter(r => r.status === 'active').length;
          const hasVolumeBonus = activeReferrals >= VOLUME_BONUS_THRESHOLD;
          
          set(state => ({
            stats: {
              ...state.stats,
              volumeBonus: hasVolumeBonus,
              volumeBonusPercentage: hasVolumeBonus ? VOLUME_BONUS_PERCENTAGE : 0
            }
          }));

          if (stats.monthlyEarnings >= PARTNER_THRESHOLD) {
            await get().updatePartnerStatus();
          }
        } catch (error) {
          console.error('Error checking volume bonus:', error);
          throw error;
        }
      },
      updatePartnerStatus: async () => {
        try {
          set(state => ({
            stats: {
              ...state.stats,
              partnerStatus: true
            }
          }));
        } catch (error) {
          console.error('Error updating partner status:', error);
          throw error;
        }
      }
    }),
    {
      name: 'referral-storage'
    }
  )
); 